import numToAlpha from './numToAlpha';

let inc = Date.now();
const numPairsRegex = /(\d{1,2})/g;

export function getUniqueSuffix(uid: string | null = null): string {
  const numPairs: string[] = [];
  let incStr = inc.toString();
  let out = '_';
  if (uid !== null) {
    out += uid;
  } else {
    let result = numPairsRegex.exec(incStr);
    while (result) {
      numPairs.push(result[0]);
      result = numPairsRegex.exec(incStr);
    }
    numPairs.forEach((pair) => {
      const val = +pair;
      if (val > 25) {
        const [first, second] = pair.split('');
        out += `${numToAlpha(+first)}${numToAlpha(+second)}`;
      } else out += numToAlpha(val);
    });
    inc += 1;
  }
  return out;
}

export default function generateClassName(c: Array<string | null>): string {
  return `${c[0]}${getUniqueSuffix(c[1])}`;
}
