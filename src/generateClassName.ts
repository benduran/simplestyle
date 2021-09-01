import numToAlpha from './numToAlpha';

export const SUFFIX_SEPARATOR = '~~~';

let inc = Date.now();

export function setSeed(seed: number | null): void {
  if (seed === null) {
    inc = Date.now();
    return;
  }
  if (typeof seed !== 'number') throw Error('Unable to setSeed as provided seed was not a valid number');
  if (seed === Number.MAX_SAFE_INTEGER)
    throw Error('Unable to setSeed because the seed was already the maximum safe JavaScript number allowed');
  if (seed === Number.POSITIVE_INFINITY || seed === Number.NEGATIVE_INFINITY)
    throw new Error('Unable to setSeed. Positive or negative infinity is not allowed');
  if (seed < 0) throw new Error('Unable to setSeed. Seed must be a number >= 0');
  inc = seed;
}

const numPairsRegex = /(\d{1,2})/g;

export function getUniqueSuffix(): string {
  const numPairs: string[] = [];
  const incStr = inc.toString();
  let result = numPairsRegex.exec(incStr);
  while (result) {
    numPairs.push(result[0]);
    result = numPairsRegex.exec(incStr);
  }
  let out = SUFFIX_SEPARATOR;
  numPairs.forEach(pair => {
    const val = +pair;
    if (val > 25) {
      const [first, second] = pair.split('');
      out += `${numToAlpha(+first)}${numToAlpha(+second)}`;
    } else out += numToAlpha(val);
  });
  inc += 1;
  return out;
}

export function generateClassName(c: string): string {
  return `${c}${getUniqueSuffix()}`;
}

/**
 * This function extracts the generated classname and creates the same object that the
 * "classes" object on the createStyles return type would contain.
 * TODO: We can probably make this return type a little smarter
 */
export function convertRenderedSheetToClassesObject(sheetContents: string): Record<string, string> {
  const matches: string[] = [];
  let buffer = '';
  for (let i = 0; i < sheetContents.length; i++) {
    const char = sheetContents.charAt(i);
    if (char === '{') {
      matches.push(buffer.replace(/^\./, ''));
      buffer = '';
    } else if (char === '}') buffer = '';
    else buffer += char;
  }
  return matches.reduce((prev, className) => {
    const [classKey] = className.replace(/^\./, '').split(SUFFIX_SEPARATOR);
    return { ...prev, [classKey]: className };
  }, {} as Record<string, string>);
}
