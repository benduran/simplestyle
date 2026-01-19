/* eslint-disable @typescript-eslint/no-non-null-assertion */
/** biome-ignore-all lint/style/noNonNullAssertion: this is a test file */
import { beforeEach, describe, expect, it } from 'vitest';
import { objectToHash } from '../generateClassName.js';
import { makeCssFuncs } from '../makeStyles.js';
import { SimpleStyleRegistry } from '../simpleStyleRegistry.js';
import type { ImportStringType } from '../types.js';

describe('SimpleStyleRegistry', () => {
  let registry: SimpleStyleRegistry | null = null;
  let fncs: ReturnType<typeof makeCssFuncs>;

  beforeEach(() => {
    const styles = Array.from(document.querySelectorAll('style'));
    for (const style of styles) style.remove();

    registry = new SimpleStyleRegistry();

    fncs = makeCssFuncs({ registry });
  });

  it('should check to make sure all styles are accumulated in the registry', () => {
    const backgroundColor = 'palevioletred';
    const fontSize = '16rem';

    const { classes } = fncs.createStyles('accumulated', () => ({
      root: {
        backgroundColor,
        fontSize,
      },
    }));

    expect(classes.root).toContain('root');
    const styles = registry?.getCSS() ?? '';
    const expectedHash = objectToHash({
      backgroundColor,
      fontSize,
    });
    expect(styles).toContain(
      `root_${expectedHash}{background-color:${backgroundColor};font-size:${fontSize};}`,
    );
    const allStyles = Array.from(document.querySelectorAll('style'));
    expect(allStyles.length).toBe(0);
  });

  it('should ensure backreferences are replaced correctly', () => {
    const backgroundColor = 'palevioletred';
    const fontSize = '16rem';
    const height = '500px';
    const width = '1000px';

    const styleId = 'backreferences-registry';
    const { classes } = fncs.createStyles(styleId, () => ({
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
    }));
    expect(classes.root).toContain('root');
    expect(classes.someBtn).toContain('someBtn');

    const styles = registry?.getCSS() ?? '';

    const someBtnHash = objectToHash({ height });
    const rootHash = objectToHash({
      backgroundColor,
      fontSize,
      '& > $someBtn': {
        width,
      },
    });
    expect(styles).toContain(
      `.${styleId}_someBtn_${someBtnHash}{height:${height};}.${styleId}_root_${rootHash}{background-color:${backgroundColor};font-size:${fontSize};}.${styleId}_root_${rootHash} > .${styleId}_someBtn_${someBtnHash}{width:${width};}`,
    );
  });

  it('should ensure keyframes and raw styles are written to the registry correctly', () => {
    const id = 'simple-animation-registry';
    const rawId = 'simple-registry-raw';

    const { keyframe } = fncs.keyframes(id, () => ({
      '0%': {
        width: '100px',
      },
      '100%': {
        width: '200px',
      },
    }));
    fncs.rawStyles(rawId, () => ({
      '*': {
        boxSizing: 'border-box',
        outline: 0,
      },
    }));

    const styleId = 'button-anim';
    const { classes } = fncs.createStyles(styleId, () => ({
      button: {
        animation: `${keyframe} 1s linear infinite`,
      },
    }));

    expect(keyframe).toMatch(new RegExp(`^${id}`));
    expect(classes.button).toMatch(new RegExp(`^${styleId}`));

    const css = registry?.getCSS().trim() ?? '';

    // must start with the keyframes
    const keyframesHash = objectToHash({
      '0%': { width: '100px' },
      '100%': { width: '200px' },
    });
    expect(css).toMatch(
      new RegExp(
        `^@keyframes simple-animation-registry_keyframes_${keyframesHash}\\{0%\\{width:100px;\\}100%\\{width:200px;\\}\\}`,
      ),
    );
    expect(css).toContain('*{box-sizing:border-box;outline:0;}');
    // and end with the styles that use them
    const buttonHash = objectToHash({
      animation: `simple-animation-registry_keyframes_${keyframesHash} 1s linear infinite`,
    });
    expect(css).toMatch(
      new RegExp(
        `\\.button-anim_button_${buttonHash}\\{animation:simple-animation-registry_keyframes_${keyframesHash} 1s linear infinite;\\}$`,
      ),
    );
  });
  it('should ensure imports are written to the registry, along with other rules', () => {
    const theImports: ImportStringType[] = [
      "@import url('https://fonts.googleapis.com/css2?family=Funnel+Display:wght@300..800&display=swap');",
      "@import url('https://csstools.github.io/normalize.css/11.0.0/normalize.css')",
    ];
    fncs.imports('import-rules', () => theImports);

    fncs.rawStyles('raw-import-subsequent-rules', () => ({
      'body, html': {
        fontFamily: 'Funnel Display',
        fontSize: '16px',
      },
    }));

    const styleTags = document.querySelectorAll('style');

    expect(styleTags.length).toBe(0);
    expect(registry?.getCSS()).toBe(`
@import url('https://fonts.googleapis.com/css2?family=Funnel+Display:wght@300..800&display=swap');@import url('https://csstools.github.io/normalize.css/11.0.0/normalize.css');
body, html{font-family:Funnel Display;font-size:16px;}`);
  });
});
