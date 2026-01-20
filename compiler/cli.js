#!/usr/bin/env node

import os from 'node:os';
import path from 'node:path';
import fs from 'fs-extra';
import { glob } from 'glob';
import createCLI from 'yargs';
import { COLLECTOR } from './collector.js';
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
  const yargs = createCLI(process.argv.slice(2));
  const {
    _,
    cwd: cwdArg,
    entrypoints,
    outfile,
  } = await yargs
    .option('cwd', {
      default: process.cwd(),
      description: 'Path to use as the current working directory',
      type: 'string',
    })
    .option('entrypoints', {
      demandOption: true,
      description: `One or more specific files or file globs for files that will be treated as your entrypoints.
All style imports will be resolved from these starting points, ensuring styles are written in the correct order.`,
      type: 'array',
    })
    .option('outfile', {
      demandOption: true,
      description:
        'location where the final, combined CSS file will be written',
      type: 'string',
    })
    .help()
    .showHelpOnFail(false).argv;

  const cwd = path.isAbsolute(cwdArg) ? cwdArg : path.resolve(cwdArg);
  if (entrypoints.some((entry) => typeof entry !== 'string' || !entry)) {
    throw new Error('one or more of your entrypoints is not valid');
  }

  const absEntrypoints = entrypoints.map((entry) =>
    path.isAbsolute(entry) ? entry : path.join(cwd, entry),
  );

  const inputFiles = (
    await glob(absEntrypoints, {
      absolute: true,
      nodir: true,
      windowsPathsNoEscape: true,
    })
  )
    .filter((fp) => !fp.includes('node_modules'))
    .sort();

  const dependencyGraph = await buildDependencyGraph(cwd, inputFiles);

  const topoSorted = topoSortGraph(dependencyGraph);

  const styleFiles = topoSorted.filter(isStyleFile);

  for (const filePath of styleFiles) {
    await extract(filePath);
  }

  await fs.ensureFile(outfile);

  const collectorEntries = [...COLLECTOR.entries()];

  const header = `@layer ${collectorEntries.map(([layerName]) => layerName).join(', ')};`;

  const styles = collectorEntries.reduce((prev, [layerName, styleChunks]) => {
    const strChunks = styleChunks.join(os.EOL);

    return `${prev}${os.EOL}@layer ${layerName} {${strChunks}}`;
  }, header);

  await fs.writeFile(outfile, styles, 'utf-8');

  console.info('✅ successfully wrote all of your styles to', outfile);
}

void executeCompiler();
