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

/**
 * Helper to ensure we don't crawl outside the project root
 * (e.g. into node_modules or system files)
 */
function isInsideCwd(cwd, filePath) {
  const relative = path.relative(cwd, filePath);
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

/**
 * Checks if a file extension is parseable by Babel
 */
function isParseable(filePath) {
  return /\.(js|ts|jsx|tsx|mjs|cjs|mts|cts)$/.test(filePath);
}

/**
 * Builds a full topological dependency graph,
 * based on user-provided entrypoints
 *
 * @param {string} cwd -
 * @param {string[]} files
 * @returns
 */
export async function buildDependencyGraph(cwd, entryPoints) {
  const graph = new Map();
  // Files we need to process
  const queue = [...entryPoints];
  // Files we have already parsed to avoid infinite loops
  const visited = new Set();

  while (queue.length > 0) {
    const filePath = queue.shift();

    if (visited.has(filePath)) continue;
    visited.add(filePath);

    // Initialize the graph entry for this file
    if (!graph.has(filePath)) {
      graph.set(filePath, new Set());
    }

    const relFilePath = path.relative(cwd, filePath);

    // Only parse JS/TS files. If it's a CSS/Asset file,
    // we record it in the graph but don't "walk" into it.
    if (!isParseable(filePath)) {
      continue;
    }

    try {
      const source = await fs.readFile(filePath, 'utf-8');
      const ast = parseFileToAst(filePath, source);
      if (!ast) continue;

      traverseAst(ast, {
        // Collect all types of imports/exports.
        // this is legal babel support for grouping the handling
        // of multiple different node types
        'ImportDeclaration|ExportAllDeclaration|ExportNamedDeclaration'(
          pathRef,
        ) {
          if (!pathRef.node.source) return;

          const resolved = resolveImport(filePath, pathRef.node.source.value);

          // If we resolved it and it's inside our project, add to graph and queue
          if (resolved && isInsideCwd(cwd, resolved)) {
            graph.get(filePath).add(resolved);
            if (!visited.has(resolved)) {
              queue.push(resolved);
            }
          }
        },
        CallExpression(pathRef) {
          const callee = pathRef.node.callee;
          const isImport = callee.type === 'Import';
          const isRequire =
            callee.type === 'Identifier' && callee.name === 'require';

          if (isImport || isRequire) {
            const arg = pathRef.node.arguments[0];
            if (arg && arg.type === 'StringLiteral') {
              const resolved = resolveImport(filePath, arg.value);
              if (resolved && isInsideCwd(cwd, resolved)) {
                graph.get(filePath).add(resolved);
                if (!visited.has(resolved)) {
                  queue.push(resolved);
                }
              }
            }
          }
        },
      });
    } catch (err) {
      console.error('error processing', relFilePath);
      console.warn(
        `[simplestyle-js] Parse error in ${relFilePath}:`,
        err.message,
      );
    }
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
