const alphas = 'abcdefghijklmnopqrstuvwxyz'.split('');

export default function numToAlpha(num: number): string {
  return alphas[num];
}
