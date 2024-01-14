import autoprefixer from 'autoprefixer';
import postcss from 'postcss';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createStyles, PosthookPlugin, registerPosthook, SimpleStyleRules } from '../src';
import { getPosthooks } from '../src/plugins';

describe('Plugin hooks', () => {
  beforeEach(() => {
    Array.from(document.head.querySelectorAll('style')).forEach(s => s.remove());
    getPosthooks().length = 0;
  });
  it('Should execute a posthook with the proper arguments', () => {
    const rules: SimpleStyleRules = {
      posthook: {
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
      },
    };
    const posthook: PosthookPlugin = vi.fn(sheetContents => {
      expect(sheetContents.length).toBeGreaterThan(0);
      expect(sheetContents.startsWith('.posthook')).toBeTruthy();
      expect(sheetContents).toContain('{background-size:contain;background-repeat:no-repeat;}');
      return sheetContents;
    });
    registerPosthook(posthook);
    createStyles(rules);
    expect(posthook).toBeCalled();
  });
  it('Should execute a posthook and transform the contents', () => {
    const rules: SimpleStyleRules = {
      posthook: {
        userSelect: 'none',
      },
    };
    // Post CSS and autoprefixer types have changed
    // so we just brute-force the typings
    const posthook: PosthookPlugin = sheetContents => postcss([autoprefixer() as any]).process(sheetContents).css;
    registerPosthook(posthook);
    const { classes, stylesheet } = createStyles(rules);
    expect(stylesheet).toBe(`.${classes.posthook}{-webkit-user-select:none;-moz-user-select:none;user-select:none;}`);
  });
});
