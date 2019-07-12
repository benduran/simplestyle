
const alphas: string[] = 'abcdefghijklmnopqrstuvwxyz'.split('');

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
      if (pairNum <= alphasLen - 1) out += alphas[pairNum];
      else out += `${alphas[first]}${alphas[second]}`;
      i++;
    } else out += alphas[first];
  }
  return `${prefix}_${out}`;
}
