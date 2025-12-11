/* eslint-disable @typescript-eslint/no-non-null-assertion */
/** biome-ignore-all lint/style/noNonNullAssertion: this is a test file */
import { beforeEach, describe, expect, it } from 'vitest';

import { setSeed } from '../generateClassName.js';
import {
  makeCreateStyles,
  makeKeyframes,
  makeRawStyles,
} from '../makeStyles.js';
import { SimpleStyleRegistry } from '../simpleStyleRegistry.js';

describe('SimpleStyleRegistry', () => {
  let registry: SimpleStyleRegistry | null = null;

  beforeEach(() => {
    const styles = Array.from(document.querySelectorAll('style'));
    for (const style of styles) style.remove();

    // we need deterministic classnames
    setSeed(0);
    registry = new SimpleStyleRegistry();
  });

  it('should check to make sure all styles are accumulated in the registry', () => {
    const createStyles = makeCreateStyles(registry!);

    const backgroundColor = 'palevioletred';
    const fontSize = '16rem';

    const { classes } = createStyles('accumulated', {
      root: {
        backgroundColor,
        fontSize,
      },
    });

    expect(classes.root).toContain('root');
    const styles = registry?.getCSS() ?? '';
    expect(styles).toContain(
      `root_a{background-color:${backgroundColor};font-size:${fontSize};}`,
    );
    const allStyles = Array.from(document.querySelectorAll('style'));
    expect(allStyles.length).toBe(0);
  });

  it('should ensure backreferences are replaced correctly', () => {
    const createStyles = makeCreateStyles(registry!);

    const backgroundColor = 'palevioletred';
    const fontSize = '16rem';
    const height = '500px';
    const width = '1000px';

    const styleId = 'backreferences-registry';
    const { classes } = createStyles(styleId, {
      someBtn: {
        height,
      },
      root: {
        backgroundColor,
        fontSize,

        '& > $someBtn': {
          width,
        },
      },
    });
    expect(classes.root).toContain('root');
    expect(classes.someBtn).toContain('someBtn');

    const styles = registry?.getCSS() ?? '';

    expect(styles).toContain(
      `.${styleId}_someBtn_a{height:${height};}.${styleId}_root_b{background-color:${backgroundColor};font-size:${fontSize};}.${styleId}_root_b > .${styleId}_someBtn_a{width:${width};}`,
    );
  });

  it('should ensure keyframes and raw styles are written to the registry correctly', () => {
    const id = 'simple-animation-registry';
    const rawId = 'simple-registry-raw';

    const rawStyles = makeRawStyles(registry!);
    const keyframes = makeKeyframes(registry!);
    const createStyles = makeCreateStyles(registry!);
    const { keyframe } = keyframes(id, {
      '0%': {
        width: '100px',
      },
      '100%': {
        width: '200px',
      },
    });
    rawStyles(rawId, {
      '*': {
        boxSizing: 'border-box',
        outline: 0,
      },
    });

    const styleId = 'button-anim';
    const { classes } = createStyles(styleId, {
      button: {
        animation: `${keyframe} 1s linear infinite`,
      },
    });

    expect(keyframe).toMatch(new RegExp(`^${id}`));
    expect(classes.button).toMatch(new RegExp(`^${styleId}`));

    const css = registry?.getCSS().trim() ?? '';

    // must start with the keyframes
    expect(css).toMatch(
      /^@keyframes simple-animation-registry_keyframes_a{0%{width:100px;}100%{width:200px;}}/,
    );
    expect(css).toContain('*{box-sizing:border-box;outline:0;}');
    // and end with the styles that use them
    expect(css).toMatch(
      /.button-anim_button_b{animation:simple-animation-registry_keyframes_a 1s linear infinite;}$/,
    );
  });
});
