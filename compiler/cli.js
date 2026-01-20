#!/usr/bin/env node

import os from 'node:os';
import path from 'node:path';
import fs from 'fs-extra';
import { glob } from 'glob';
import minimist from 'minimist';
import { COLLECTOR } from './collector.js';
import { EXTENSIONS } from './constants.js';
import {
  buildDependencyGraph,
  isStyleFile,
  topoSortGraph,
} from './dependencyGraph.js';
import { extract } from './register.js';

/**
 * @typedef {object} CompilerOpts
 * @property {string} cwd
 * @property {string} inputDir
 * @property {string} outfile
 */

async function executeCompiler() {
  const cliOpts = minimist(process.argv.slice(2));

  let cwd = cliOpts.cwd ?? process.cwd();
  cwd = path.isAbsolute(cwd) ? cwd : path.resolve(cwd);
  const inputDir = cliOpts.input || path.join(cwd, 'src');
  const outfile = cliOpts.outfile || path.join(inputDir, 'index.css');

  const inputGlobs = EXTENSIONS.map((ext) =>
    path.join(inputDir, '**', `*${ext}`),
  );

  const inputFiles = (
    await Promise.all(
      inputGlobs.map((g) => glob(g, { absolute: true, nodir: true })),
    )
  )
    .flat()
    .filter((fp) => !fp.includes('node_modules'))
    .sort();

  const dependencyGraph = await buildDependencyGraph(inputFiles, inputDir);

  const topoSorted = topoSortGraph(dependencyGraph);

  const styleFiles = topoSorted.filter(isStyleFile);

  for (const filePath of styleFiles) {
    await extract(filePath);
  }

  if (!COLLECTOR.length) {
    return console.warn('no styles were created so no output file was written');
  }

  await fs.ensureFile(outfile);
  await fs.writeFile(outfile, COLLECTOR.join(os.EOL), 'utf-8');

  console.info('✅ successfully wrote all of your styles to', outfile);
}

void executeCompiler();
