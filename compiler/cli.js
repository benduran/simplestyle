#!/usr/bin/env node

import os from 'node:os';
import path from 'node:path';
import chokidar from 'chokidar';
import fs from 'fs-extra';
import { glob } from 'glob';
import createCLI from 'yargs';
import { COLLECTOR, resetCollector, resetSeenIds } from './collector.js';
import {
  buildDependencyGraph,
  isStyleFile,
  topoSortGraph,
} from './dependencyGraph.js';
import { getCommonRootPath } from './getCommonRootPath.js';
import { extract } from './register.js';

/** @type {ReturnType<typeof chokidar.watch> | null | undefined} */
let watcher = null;

/**
 * actually compiles the css file
 * @param {string} cwd
 * @param {string[]} entrypoints
 * @param {string} outfile
 */
async function doCompile(cwd, entrypoints, outfile) {
  resetCollector();
  resetSeenIds();

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

  if (!styleFiles) {
    console.warn('no style files were detected so', outfile, 'was not written');
    return topoSorted;
  }

  for (const filePath of styleFiles) {
    console.info('processing', path.relative(cwd, filePath));
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

  return topoSorted;
}

async function executeCompiler() {
  const yargs = createCLI(process.argv.slice(2));
  const {
    _,
    cwd: cwdArg,
    entrypoints: entrypointsArg,
    outfile,
    watch,
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
    .option('watch', {
      default: false,
      description:
        'if true, watches all *.style files and rebuilds the resulting css file when changes occur.',
      type: 'boolean',
    })
    .help()
    .showHelpOnFail(false).argv;

  const cwd = path.isAbsolute(cwdArg) ? cwdArg : path.resolve(cwdArg);
  if (entrypointsArg.some((entry) => typeof entry !== 'string' || !entry)) {
    throw new Error('one or more of your entrypoints is not valid');
  }

  const entrypoints = /** @type {string[]} */ (entrypointsArg);

  const filesTraversed = await doCompile(cwd, entrypoints, outfile);

  if (watch) {
    const longestCommonParent = getCommonRootPath(filesTraversed);
    const normalizedOutfile = path.isAbsolute(outfile)
      ? outfile
      : path.join(cwd, outfile);

    watcher = chokidar.watch(path.join(longestCommonParent, '.'), {
      awaitWriteFinish: {
        pollInterval: 100,
        stabilityThreshold: 100,
      },
      cwd,
      followSymlinks: true,
      ignored: (fp) => {
        const normalizedPath = path.isAbsolute(fp) ? fp : path.join(cwd, fp);
        if (normalizedPath === normalizedOutfile) return true;
        return (
          normalizedPath.includes(`${path.sep}node_modules${path.sep}`) ||
          normalizedPath.includes(`${path.sep}.git${path.sep}`)
        );
      },
      ignoreInitial: true,
    });

    console.info('👀 watching for file changes in', longestCommonParent);

    /** @type {any} */
    let recompilerTimeout = null;

    /** @type {Set<string>} */
    let changedFiles = new Set();

    /**
     * determines if things need recompiling
     * @param {string} fp
     */
    const determineIfRecompile = (fp) => {
      changedFiles.add(fp);

      if (recompilerTimeout) {
        clearTimeout(recompilerTimeout);
      }
      recompilerTimeout = setTimeout(() => {
        console.info(
          `recompiling due to the following files changed:${os.EOL}${[...changedFiles].map((fp) => `  ${fp}`).join(os.EOL)}`,
        );

        doCompile(cwd, entrypoints, outfile).catch((err) => {
          console.error(err);
        });

        changedFiles = new Set();
      }, 250);
    };

    watcher.on('add', determineIfRecompile);
    watcher.on('change', determineIfRecompile);
    watcher.on('unlink', determineIfRecompile);

    const attempGracefulShutdown = async () => {
      try {
        if (recompilerTimeout) {
          clearTimeout(recompilerTimeout);
        }
        await watcher?.close();
      } catch {
        /* no-op */
      }
      process.exit(0);
    };

    process.once('SIGINT', attempGracefulShutdown);
    process.once('SIGTERM', attempGracefulShutdown);
  }
}

void executeCompiler();
