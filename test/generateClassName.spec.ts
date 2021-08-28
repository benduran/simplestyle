import { generateClassName, setSeed } from '../src/generateClassName';

describe('generateClassName tests', () => {
  it('Should generate multiple unique classnames', () => {
    const input = ['one', 'deux', 'tres', 'four'];
    const output = input.map(generateClassName);
    expect(output[0]).not.toBe(output[1]);
    expect(output[0]).not.toBe(output[2]);
    expect(output[0]).not.toBe(output[3]);
    expect(output[0]).not.toBe(output[1]);
    expect(output[1]).not.toBe(output[2]);
    expect(output[1]).not.toBe(output[3]);
    expect(output[2]).not.toBe(output[0]);
    expect(output[2]).not.toBe(output[3]);
  });
  it('Should throw errors if an invalid seed is provided', () => {
    try {
      setSeed('bad' as any);
    } catch (error) {
      const e = error as Error;
      expect(e).toBeInstanceOf(Error);
      expect(e.message).toContain('not a valid number');
    }
    try {
      setSeed(Number.MAX_SAFE_INTEGER);
    } catch (error) {
      const e = error as Error;
      expect(e).toBeInstanceOf(Error);
      expect(e.message).toContain('maximum safe JavaScript');
    }
    try {
      setSeed(Number.POSITIVE_INFINITY);
    } catch (error) {
      const e = error as Error;
      expect(e).toBeInstanceOf(Error);
      expect(e.message).toContain('Positive or negative');
    }
    try {
      setSeed(-1);
    } catch (error) {
      const e = error as Error;
      expect(e).toBeInstanceOf(Error);
      expect(e.message).toContain('number >= 0');
    }
  });
});
