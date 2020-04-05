
import { keyframes } from '../src';

describe('Keyframes generation', () => {
  it('Should generate simple animation keyframes', () => {
    const [keyframeName, sheetContents] = keyframes({
      '0%': {
        width: '100px',
      },
      '100%': {
        width: '200px',
      },
    });
    expect(keyframeName).toBeDefined();
    expect(keyframeName.length).toBeGreaterThan(0);
    expect(sheetContents).toBe(`@keyframes ${keyframeName}{0%{width:100px;}100%{width:200px;}}`);
  });
});
