import { deepEqual } from '../src/util';

describe('Deep Object Equality utility', () => {
  it('Should veryify two simple objects are not equal', () => {
    const o1 = {
      one: 'uno',
      two: 'dos',
    };
    const o2 = {
      one: 'uno',
      two: 'dos',
      three: 'tres',
    };
    expect(deepEqual(o1, o2)).toBeFalsy();
  });
  it('Should veryify two simple objects are equal', () => {
    const o1 = {
      one: 'uno',
      two: 'dos',
    };
    const o2 = {
      one: 'uno',
      two: 'dos',
    };
    expect(deepEqual(o1, o2)).toBeTruthy();
  });
  it('Should veryify two simple objects with the same keys but different values are not equal', () => {
    const o1 = {
      one: 'one',
      two: 'dos',
    };
    const o2 = {
      one: 'uno',
      two: 'dos',
    };
    expect(deepEqual(o1, o2)).toBeFalsy();
  });
  it('Should verify two 1-layer deep objects are equal', () => {
    const o1 = {
      one: 'uno',
      two: 'dos',
      nested: {
        yes: 'yes',
        no: 'nopers',
      },
    };
    const o2 = {
      one: 'uno',
      two: 'dos',
      nested: {
        yes: 'yes',
        no: 'nopers',
      },
    };
    expect(deepEqual(o1, o2)).toBeTruthy();
  });
  it('Should verify two 1-layer deep objects with the same keys are not equal', () => {
    const o1 = {
      one: 'uno',
      two: 'dos',
      nested: {
        yes: 'yes',
        no: 'nopers',
      },
    };
    const o2 = {
      one: 'uno',
      two: 'dos',
      nested: {
        yes: 'absolutely',
        no: 'nopers',
      },
    };
    expect(deepEqual(o1, o2)).toBeFalsy();
  });
  it('Should verify two 1-layer deep objects with different keys are not equal', () => {
    const o1 = {
      one: 'uno',
      two: 'dos',
      nested: {
        color: 'pink',
        width: 10,
      },
    };
    const o2 = {
      one: 'uno',
      two: 'dos',
      nested: {
        yes: 'absolutely',
        no: 'nopers',
      },
    };
    expect(deepEqual(o1, o2)).toBeFalsy();
  });
});
