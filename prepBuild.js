const { execSync } = require('child_process');
const path = require('path');

const glob = require('fast-glob');
const fs = require('fs-extra');

const distDir = path.join(__dirname, 'dist');

const allFiles = glob.sync(path.join(distDir, '**', '**'), { absolute: true, onlyFiles: true });

execSync('rm -rf ./dist', { stdio: 'inherit' });

execSync('tsc --project ./tsconfig.json', { stdio: 'inherit' });

execSync('tsc --project ./tsconfig.commonjs.json', { stdio: 'inherit' });

setTimeout(() => {
  // We prepare the source maps so they're not wrong
  allFiles
    .filter(fp => fp.endsWith('.map'))
    .forEach(fp => {
      const contents = JSON.parse(fs.readFileSync(fp, 'utf8'));
      for (let i = 0; i < contents.sources.length; i++) {
        contents.sources[i] = `./${path.basename(contents.sources[i])}`;
        fs.writeFileSync(fp, JSON.stringify(contents), 'utf8');
      }
    });

  // Copy the package.json file from the root and prep it so that we don't get the cruft
  // from the root
  const pJsonContents = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
  delete pJsonContents.devDependencies;
  delete pJsonContents.scripts;

  // Set all files that should be included
  pJsonContents.files = allFiles
    .filter(fp => fp.endsWith('.js') || fp.endsWith('.map') || fp.endsWith('.ts'))
    .map(fp => fp.replace(distDir, '.'));
  fs.writeFileSync(path.join(distDir, 'package.json'), JSON.stringify(pJsonContents, null, 2), 'utf8');
  setTimeout(() => {
    process.chdir(distDir);

    execSync('npm pack', { stdio: 'inherit' });
  }, 1);
}, 1);
