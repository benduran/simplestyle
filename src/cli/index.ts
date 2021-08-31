import fastGlob from 'fast-glob';
import inquirer from 'inquirer';
import yargs from 'yargs';

interface CLIArgs {
  glob: string;
}

async function setupCLI() {
  const { glob } = yargs
    .scriptName('simplestyle-cli')
    .option('glob', { description: 'Valid glob where your JS / TS styles live', requiresArg: true, type: 'string' })
    .help().argv as CLIArgs;

  if (!glob) yargs.showHelp();
  else {
    // Do the stuffs
    const foundFiles = await fastGlob(glob, { onlyFiles: true });
    const { shouldContinue } = await inquirer.prompt<{ shouldContinue: boolean }>([
      {
        message: `Found the following files: \n${foundFiles.join(', ')}\n Do you want to continue?`,
        name: 'shouldContinue',
        type: 'confirm',
      },
    ]);
    if (!shouldContinue) return;
  }
}
setupCLI();
