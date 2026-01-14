import { setTimeout } from 'node:timers/promises';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { setSeed } from '../generateClassName.js';
import { makeCssFuncs } from '../makeStyles.js';
import { SimpleStyleRegistry } from '../simpleStyleRegistry.js';
import type { ImportStringType } from '../types.js';

describe('SimpleStyleRegistry', () => {
  let registry: SimpleStyleRegistry | null = null;
  let fncs: ReturnType<typeof makeCssFuncs>;

  beforeEach(() => {
    const styles = Array.from(document.querySelectorAll('style'));
    for (const style of styles) style.remove();

    // we need deterministic classnames
    setSeed(0);
    registry = new SimpleStyleRegistry();

    fncs = makeCssFuncs({ registry });
  });
  afterEach(() => {
    registry?.off('add');
    registry?.off('settled');
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
    expect(styles).toContain(
      `root_a{background-color:${backgroundColor};font-size:${fontSize};}`,
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

    expect(styles).toContain(
      `.${styleId}_someBtn_a{height:${height};}.${styleId}_root_b{background-color:${backgroundColor};font-size:${fontSize};}.${styleId}_root_b > .${styleId}_someBtn_a{width:${width};}`,
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
    expect(css).toMatch(
      /^@keyframes simple-animation-registry_keyframes_a{0%{width:100px;}100%{width:200px;}}/,
    );
    expect(css).toContain('*{box-sizing:border-box;outline:0;}');
    // and end with the styles that use them
    expect(css).toMatch(
      /.button-anim_button_b{animation:simple-animation-registry_keyframes_a 1s linear infinite;}$/,
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
  it('should bind an event handler to be called whenever a sheet is added to the registry and ensure when off is called nothing else fires', () => {
    const ruleId = 'amsdoiamiodmas090-123';
    const ruleId2 = '910fms0dfim-1231n';
    const ruleId3 = '9fmsdf90342-123f';
    const rules = {
      thing: {
        height: '111111px',
        width: '9999rem',
      },
    };
    const rules2 = {
      pizza: {
        fontWeight: 'bold',
        lineHeight: '1.4',
      },
    };
    const rules3 = {
      pasta: {
        fontStyle: 'italic',
        textDecoration: 'underline',
      },
    };

    const fnc = vi.fn();
    registry?.on('add', fnc);

    const { classes } = fncs.createStyles(ruleId, () => rules);
    const { classes: classes2 } = fncs.createStyles(ruleId2, () => rules2);

    expect(fnc).toHaveBeenNthCalledWith(
      1,
      ruleId,
      `.${classes.thing}{height:${rules.thing.height};width:${rules.thing.width};}`,
    );
    expect(fnc).toHaveBeenNthCalledWith(
      2,
      ruleId2,
      `.${classes2.pizza}{font-weight:${rules2.pizza.fontWeight};line-height:${rules2.pizza.lineHeight};}`,
    );
    registry?.off('add', fnc);

    fncs.createStyles(ruleId3, () => rules3);

    expect(fnc).not.toHaveBeenCalledTimes(3);

    registry?.on('add', fnc);

    const { classes: classes3 } = fncs.createStyles(ruleId3, () => rules3);

    expect(fnc).toHaveBeenNthCalledWith(
      3,
      ruleId3,
      `.${classes3.pasta}{font-style:${rules3.pasta.fontStyle};text-decoration:${rules3.pasta.textDecoration};}`,
    );

    registry?.off('add');

    fncs.createStyles(ruleId3, () => rules3);

    expect(fnc).not.toHaveBeenCalledTimes(4);
  });

  it.only('should fire a final "settled" event when the last stylesheet has been added', async () => {
    const ruleId = 'amsdoiamiodmas090-124';
    const ruleId2 = '910fms0dfim-12311asd';
    const ruleId3 = '9fmsdf90342-12asdz';
    const rules = {
      thing: {
        height: '111112px',
        width: '9991rem',
      },
    };
    const rules2 = {
      pizza: {
        fontWeight: '600',
        lineHeight: '1.8',
      },
    };
    const rules3 = {
      pasta: {
        fontStyle: 'initial',
        textDecoration: 'blink',
      },
    };

    const fnc = vi.fn();
    registry?.on('settled', fnc);

    fncs.createStyles(ruleId, () => rules);
    fncs.createStyles(ruleId2, () => rules2);
    fncs.createStyles(ruleId3, () => rules3);

    await setTimeout(20);

    fncs.createStyles(ruleId3, () => rules);

    await setTimeout(51);

    expect(fnc).toHaveBeenCalledTimes(1);
  });
});
