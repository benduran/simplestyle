import { describe, expect, it } from 'vitest';
import { objectToHash } from '../makeStyles/generateClassName.js';
import { makeCssFuncs } from '../ssr/index.js';

describe('makeCssFuncs (SSR)', () => {
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

    const { stylesheet } = createStyles('some-rule', (vars) => ({
      root: {
        backgroundColor: vars.background.primary.default,
        color: vars?.color.text.default,
      },
    }));

    const expectedHash = objectToHash({
      backgroundColor: lolBackgroundColor,
      color: lolColor,
    });
    expect(stylesheet.trim()).toBe(
      `.some-rule_root_${expectedHash}{background-color:${lolBackgroundColor};color:${lolColor};}`,
    );
  });

  it('should return a stylesheet without flushing', () => {
    const lolColor = 'racing stripes';
    const { createStyles } = makeCssFuncs({
      variables: {
        color: {
          text: {
            default: lolColor,
          },
        },
      },
    });

    const { classes, stylesheet } = createStyles('callback-rule', (vars) => ({
      root: {
        color: vars.color.text.default,
      },
    }));

    expect(stylesheet).toBe(`.${classes.root}{color:${lolColor};}`);
  });
});
