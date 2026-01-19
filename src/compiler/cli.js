import path from 'node:path';
import { glob } from 'glob';
import minimist from 'minimist';

/**
 * @typedef {object} CompilerOpts
 * @property {string} cwd
 * @property {string} inputDir
 * @property {string} outfile
 */

const EXTENSIONS = [
  '.ts',
  '.tsx',
  '.cts',
  '.mts',
  '.cjs',
  '.mjs',
  '.js',
  '.jsx',
];

async function executeCompiler() {
  const cliOpts = minimist(process.argv.slice(2));

  let cwd = cliOpts.cwd ?? process.cwd();
  cwd = path.isAbsolute(cwd) ? cwd : path.resolve(cwd);
  const inputDir = cliOpts.input || path.join(cwd, 'src');

  const inputGlobs = EXTENSIONS.map((ext) =>
    path.join(inputDir, '**', `*${ext}`),
  );

  const inputFiles = (
    await Promise.all(
      inputGlobs.map((g) => glob(g, { absolute: true, nodir: true })),
    )
  )
    .flat()
    .filter((fp) => !fp.includes('node_modules'));
}

void executeCompiler();
