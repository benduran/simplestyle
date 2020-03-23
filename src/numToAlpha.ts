
const alphas = 'abcdefghijklmnopqrstuvwxyz'.split('');

export default function numToAlpha(num: number): string {
  console.info(alphas);
  return alphas[num - 1];
}
