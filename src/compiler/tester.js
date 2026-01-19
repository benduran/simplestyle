import fs from 'node:fs';
import path from 'node:path';
import { extract } from './register.js';

const [fp] = process.argv.slice(2);

if (!fp) {
  throw new Error(
    'missing first positional argument, which should be a path to a file',
  );
}

const stat = fs.statSync(path.isAbsolute(fp) ? fp : path.resolve(fp), {
  throwIfNoEntry: false,
});

if (!stat?.isFile()) {
  throw new Error(`${fp} is not a file`);
}

const result = await extract(fp);

console.info(result);
