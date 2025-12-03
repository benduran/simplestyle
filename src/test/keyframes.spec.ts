import { describe, expect, it } from 'vitest';

import { keyframes } from '../index.js';

describe('Keyframes generation', () => {
  it('Should generate simple animation keyframes', () => {
    const { keyframe, stylesheet } = keyframes('simple-animation', {
      '0%': {
        width: '100px',
      },
      '100%': {
        width: '200px',
      },
    });
    expect(keyframe).toBeDefined();
    expect(keyframe.length).toBeGreaterThan(0);
    expect(stylesheet).toBe(`@keyframes ${keyframe}{0%{width:100px;}100%{width:200px;}}`);
  });
});
