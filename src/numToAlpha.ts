const alphas = 'abcdefghijklmnopqrstuvwxyz'.split('');

export default function numToAlpha(num: number): string {
  return String(alphas[num]);
}
