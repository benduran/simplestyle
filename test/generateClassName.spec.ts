
import generateClassName from '../src/generateClassName';

describe('generateClassName tests', () => {
  it('Should generate multiple unique classnames', () => {
    const input = [
      'one',
      'deux',
      'tres',
      'four',
    ];
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
});
