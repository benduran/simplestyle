
const alphas: string[] = [
  'a',
  'b',
  'c',
  'd',
  'e',
  'f',
  'g',
  'h',
  'i',
  'j',
  'k',
  'l',
  'm',
  'n',
  'o',
  'p',
  'q',
  'r',
  's',
  't',
  'u',
  'v',
  'w',
  'x',
  'y',
  'z',
];

const alphasLen = alphas.length;

export default function createClassName(seed: number, prefix: string = '') {
  // split into pairs
  let out = '';
  const seedStr = seed.toString();
  const len = seedStr.length;
  for (let i = 0; i < len; i++) {
    const first = +seedStr[i];
    if (i < len - 2) {
      const second = +seedStr[i + 1];
      const pairNum = Number.parseInt(`${first}${second}`, 10);
      if (pairNum <= alphasLen) out += alphas[pairNum];
      else out += `${alphas[first]}${alphas[second]}`;
      i++;
    } else out += alphas[first];
  }
  return `${prefix}${out}`;
}
