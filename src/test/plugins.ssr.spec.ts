import autoprefixer from 'autoprefixer';
import postcss from 'postcss';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { PosthookPlugin, SimpleStyleRules } from '../ssr/index.js';
import { makeCssFuncs, registerPosthook } from '../ssr/index.js';
import { getPosthooks } from '../plugins.js';

describe('Plugin hooks (SSR)', () => {
  const { createStyles } = makeCssFuncs();

  afterEach(() => {
    getPosthooks().length = 0;
  });

  it('Should execute a posthook with the proper arguments', () => {
    const rules: SimpleStyleRules = {
      posthook: {
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
      },
    };
    const posthook: PosthookPlugin = vi.fn((sheetContents) => {
      expect(sheetContents.length).toBeGreaterThan(0);
      expect(sheetContents.startsWith('.posthook')).toBeTruthy();
      expect(sheetContents).toContain(
        '{background-size:contain;background-repeat:no-repeat;}',
      );
      return sheetContents;
    });
    registerPosthook(posthook);
    createStyles('posthook', () => rules);
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
    const posthook: PosthookPlugin = (sheetContents) =>
      postcss([autoprefixer() as any]).process(sheetContents).css;
    registerPosthook(posthook);
    const { classes, stylesheet } = createStyles(
      'posthook-transform',
      () => rules,
    );
    expect(stylesheet).toBe(
      `.${classes.posthook}{-webkit-user-select:none;-moz-user-select:none;user-select:none;}`,
    );
  });
});
