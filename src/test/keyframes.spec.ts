import { beforeEach, describe, expect, it } from 'vitest';

import { keyframes } from '../index.js';

describe('Keyframes generation', () => {
  beforeEach(() => {
    document.querySelectorAll('style').forEach((s) => {
      s.remove();
    });
  });
  it('Should generate simple animation keyframes', () => {
    const { keyframe, stylesheet } = keyframes('simple-animation', () => ({
      '0%': {
        width: '100px',
      },
      '100%': {
        width: '200px',
      },
    }));
    expect(keyframe).toBeDefined();
    expect(keyframe.length).toBeGreaterThan(0);
    expect(stylesheet).toBe(
      `@keyframes ${keyframe}{0%{width:100px;}100%{width:200px;}}`,
    );
  });
  it('Should generate keyframes with options callback and skip flushing', () => {
    const { keyframe, stylesheet } = keyframes(
      'simple-animation-callback',
      () => ({
        '0%': {
          width: '100px',
        },
        '100%': {
          width: '200px',
        },
      }),
      () => ({ flush: false }),
    );
    expect(stylesheet).toBe(
      `@keyframes ${keyframe}{0%{width:100px;}100%{width:200px;}}`,
    );
    expect(document.querySelectorAll('style').length).toBe(0);
  });
});
