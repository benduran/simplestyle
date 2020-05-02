import generateClassName from '../src/generateClassName';

describe('generateClassName tests', () => {
  it('Should generate multiple unique classnames', () => {
    const input = [
      ['one', '123456789'],
      ['deux', null],
      ['tres', '123456789'],
      ['four', null],
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
