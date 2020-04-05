
import numToAlpha from './numToAlpha';

let inc = Date.now();
const numPairsRegex = /(\d{1,2})/g;

export function getUniqueSuffix(): string {
  const numPairs: string[] = [];
  const incStr = inc.toString();
  let result = numPairsRegex.exec(incStr);
  while (result) {
    numPairs.push(result[0]);
    result = numPairsRegex.exec(incStr);
  }
  let out = '_';
  numPairs.forEach((pair) => {
    const val = +pair;
    if (val > 25) {
      const [first, second] = pair.split('');
      out += `${numToAlpha(+first)}${numToAlpha(+second)}`;
    } else out += numToAlpha(val);
  });
  inc += 1;
  return out;
}

export default function generateClassName(c: string): string {
  return `${c}${getUniqueSuffix()}`;
}
