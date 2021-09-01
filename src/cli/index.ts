import fastGlob from 'fast-glob';
import fs from 'fs-extra';
import inquirer from 'inquirer';
import path from 'path';
import yargs from 'yargs';

import createStyles from '../createStyles';

interface CLIArgs {
  glob: string;
}

async function renderSheets(stylePaths: string[]) {
  return Promise.all(
    stylePaths.map(async sp => {
      // @ts-ignore
      const styleResult = (await import(sp)).default as ReturnType<typeof createStyles>;
      console.info(styleResult);
      const basename = path.basename(sp);
      const filename = `${basename.split('.')[0]}.css`;
      await fs.writeFile(path.join(sp.replace(basename, ''), filename), styleResult.stylesheet, 'utf8');
    }),
  );
}

async function setupCLI() {
  const { glob } = yargs
    .scriptName('simplestyle-cli')
    .option('glob', {
      alias: 'g',
      description: 'Valid glob where your JS / TS styles live',
      demandOption: true,
      requiresArg: true,
      type: 'string',
    })
    .positional('glob', {})
    .help().argv as CLIArgs;

  if (!glob) yargs.showHelp();
  else {
    // Do the stuffs
    const foundFiles = await fastGlob(glob, { absolute: true, onlyFiles: true });
    const { shouldContinue } = await inquirer.prompt<{ shouldContinue: boolean }>([
      {
        message: `Found the following files: \n\n${foundFiles.join(', ')}\n\n Do you want to continue?`,
        name: 'shouldContinue',
        type: 'confirm',
      },
    ]);
    if (!shouldContinue) return;
    await renderSheets(foundFiles);
  }
}
setupCLI();
