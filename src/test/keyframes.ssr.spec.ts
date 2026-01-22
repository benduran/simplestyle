import { describe, expect, it } from 'vitest';
import { makeCssFuncs } from '../ssr/index.js';

describe('Keyframes generation (SSR)', () => {
  const { createKeyframes } = makeCssFuncs();

  it('Should generate simple animation keyframes', () => {
    const { keyframe, stylesheet } = createKeyframes(
      'simple-animation',
      () => ({
        '0%': {
          width: '100px',
        },
        '100%': {
          width: '200px',
        },
      }),
    );
    expect(keyframe).toBeDefined();
    expect(keyframe.length).toBeGreaterThan(0);
    expect(stylesheet).toBe(
      `@keyframes ${keyframe}{0%{width:100px;}100%{width:200px;}}`,
    );
  });
  it('Should generate keyframes without flushing', () => {
    const { keyframe, stylesheet } = createKeyframes(
      'simple-animation-callback',
      () => ({
        '0%': {
          width: '100px',
        },
        '100%': {
          width: '200px',
        },
      }),
    );
    expect(stylesheet).toBe(
      `@keyframes ${keyframe}{0%{width:100px;}100%{width:200px;}}`,
    );
  });
});
