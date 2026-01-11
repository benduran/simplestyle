import { beforeEach, describe, expect, it } from 'vitest';
import { setSeed } from '../generateClassName.js';
import { makeCssFuncs } from '../makeStyles.js';
import { SimpleStyleRegistry } from '../simpleStyleRegistry.js';

setSeed(999);

describe('makeCssFuncs', () => {
  beforeEach(() => {
    document.querySelectorAll('style').forEach((s) => {
      s.remove();
    });
  });
  it('should ensure that a class name is created with rules from our defined variables with no registry', () => {
    const lolBackgroundColor = 'purple-people-eater';
    const lolBackgroundColorSecondary = 'orange orangutan';
    const lolColor = 'this color is sexy';
    const lolColorSecondary = 'this color is not as sexy';

    const { createStyles } = makeCssFuncs({
      variables: {
        background: {
          primary: {
            default: lolBackgroundColor,
            secondary: lolBackgroundColorSecondary,
          },
        },
        color: {
          text: {
            default: lolColor,
            somethingElse: lolColorSecondary,
          },
        },
      },
    });

    createStyles('some-rule', (vars) => ({
      root: {
        backgroundColor: vars.background.primary.default,
        color: vars?.color.text.default,
      },
    }));

    const styleElem = document.head.querySelector(
      'style',
    ) as HTMLStyleElement | null;
    const contents = styleElem?.innerHTML ?? '';

    expect(contents.trim()).toBe(
      `.some-rule_root_jjj{background-color:${lolBackgroundColor};color:${lolColor};}`,
    );
  });
  it('should ensure that a class name is created with rules from our defined variables with a registry', () => {
    const lolBackgroundColor = 'uno banana';
    const lolBackgroundColorSecondary = 'dos tacos';
    const lolColor = 'tres colores';
    const lolColorSecondary = 'quatro quesos';

    const registry = new SimpleStyleRegistry();

    const { createStyles } = makeCssFuncs({
      registry,
      variables: {
        background: {
          primary: {
            default: lolBackgroundColor,
            secondary: lolBackgroundColorSecondary,
          },
        },
        color: {
          text: {
            default: lolColor,
            somethingElse: lolColorSecondary,
          },
        },
      },
    });

    createStyles('some-rule', (vars) => ({
      root: {
        backgroundColor: vars?.background.primary.default,
        color: vars?.color.text.default,
      },
    }));

    expect(registry.getCSS().trim()).toBe(
      `.some-rule_root_ka{background-color:${lolBackgroundColor};color:${lolColor};}`,
    );
  });
  it('should allow opts and overrides callbacks', () => {
    const lolColor = 'racing stripes';
    const { createStyles } = makeCssFuncs(() => ({
      variables: {
        color: {
          text: {
            default: lolColor,
          },
        },
      },
    }));

    const { classes, stylesheet } = createStyles(
      'callback-rule',
      (vars) => ({
        root: {
          color: vars.color.text.default,
        },
      }),
      () => ({ flush: false }),
    );

    expect(stylesheet).toBe(`.${classes.root}{color:${lolColor};}`);
    expect(document.querySelectorAll('style').length).toBe(0);
  });
});
