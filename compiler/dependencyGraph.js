import { createRequire } from 'node:module';
import path from 'node:path';
import { parseSync } from '@babel/core';
import traverseModule from '@babel/traverse';
import fs from 'fs-extra';
import { EXTENSIONS } from './constants.js';

const STYLE_FILE_REGEX = /\.styles\.(js|cjs|mjs|ts|mts|cts|jsx|tsx)$/;

const require = createRequire(import.meta.url);

const PRESETS = [
  [require.resolve('@babel/preset-env')],
  [
    require.resolve('@babel/preset-typescript'),
    { allExtensions: true, isTSX: true },
  ],
];

export function isStyleFile(filePath) {
  return STYLE_FILE_REGEX.test(filePath);
}

function isInsideRoot(rootDir, candidate) {
  const relative = path.relative(rootDir, candidate);
  return !!relative && !relative.startsWith('..') && !path.isAbsolute(relative);
}

function resolveWithExtensions(basePath) {
  if (fs.existsSync(basePath) && fs.statSync(basePath).isFile()) {
    return basePath;
  }
  for (const ext of EXTENSIONS) {
    const candidate = `${basePath}${ext}`;
    if (fs.existsSync(candidate)) return candidate;
  }
  return null;
}

function resolveIndexFile(baseDir) {
  if (!fs.existsSync(baseDir) || !fs.statSync(baseDir).isDirectory())
    return null;
  for (const ext of EXTENSIONS) {
    const candidate = path.join(baseDir, `index${ext}`);
    if (fs.existsSync(candidate)) return candidate;
  }
  return null;
}

function resolveImport(fromFile, source) {
  if (!source) return null;
  const absoluteFromFile = path.isAbsolute(fromFile)
    ? fromFile
    : path.resolve(fromFile);
  if (source.startsWith('.')) {
    const basePath = path.resolve(path.dirname(absoluteFromFile), source);
    return resolveWithExtensions(basePath) ?? resolveIndexFile(basePath);
  }
  if (path.isAbsolute(source)) {
    return resolveWithExtensions(source) ?? resolveIndexFile(source);
  }
  return null;
}

const traverseAst = traverseModule.default ?? traverseModule;

function parseFileToAst(filePath, source) {
  return parseSync(source, {
    babelrc: false,
    configFile: false,
    filename: filePath,
    presets: PRESETS,
    sourceType: 'module',
  });
}

export async function buildDependencyGraph(files, inputDir) {
  const rootDir = path.resolve(inputDir);
  const graph = new Map();
  const sortedFiles = [...files].sort();

  for (const filePath of sortedFiles) {
    graph.set(filePath, new Set());
  }

  for (const filePath of sortedFiles) {
    const source = await fs.readFile(filePath, 'utf-8');
    const ast = parseFileToAst(filePath, source);
    if (!ast) continue;

    traverseAst(ast, {
      ImportDeclaration(pathRef) {
        const resolved = resolveImport(
          path.resolve(filePath),
          pathRef.node.source?.value,
        );
        if (resolved && isInsideRoot(rootDir, resolved)) {
          graph.get(filePath)?.add(resolved);
        }
      },
      ExportAllDeclaration(pathRef) {
        const resolved = resolveImport(
          path.resolve(filePath),
          pathRef.node.source?.value,
        );
        if (resolved && isInsideRoot(rootDir, resolved)) {
          graph.get(filePath)?.add(resolved);
        }
      },
      ExportNamedDeclaration(pathRef) {
        const resolved = resolveImport(
          path.resolve(filePath),
          pathRef.node.source?.value,
        );
        if (resolved && isInsideRoot(rootDir, resolved)) {
          graph.get(filePath)?.add(resolved);
        }
      },
      CallExpression(pathRef) {
        const callee = pathRef.node.callee;
        if (callee.type === 'Import') {
          const arg = pathRef.node.arguments[0];
          const resolved =
            arg && arg.type === 'StringLiteral'
              ? resolveImport(path.resolve(filePath), arg.value)
              : null;
          if (resolved && isInsideRoot(rootDir, resolved)) {
            graph.get(filePath)?.add(resolved);
          }
          return;
        }
        if (callee.type === 'Identifier' && callee.name === 'require') {
          const arg = pathRef.node.arguments[0];
          const resolved =
            arg && arg.type === 'StringLiteral'
              ? resolveImport(path.resolve(filePath), arg.value)
              : null;
          if (resolved && isInsideRoot(rootDir, resolved)) {
            graph.get(filePath)?.add(resolved);
          }
        }
      },
    });
  }

  return graph;
}

export function topoSortGraph(graph) {
  const sortedNodes = [...graph.keys()].sort();
  const visited = new Set();
  const visiting = new Set();
  const result = [];

  const visit = (node) => {
    if (visited.has(node)) return;
    if (visiting.has(node)) {
      console.warn('Detected a circular dependency involving', node);
      return;
    }
    visiting.add(node);
    const deps = [...(graph.get(node) ?? [])].sort();
    for (const dep of deps) {
      if (graph.has(dep)) {
        visit(dep);
      }
    }
    visiting.delete(node);
    visited.add(node);
    result.push(node);
  };

  for (const node of sortedNodes) {
    visit(node);
  }

  return result;
}
