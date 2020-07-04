import autoprefixer from 'autoprefixer';
import postcss from 'postcss';

import {
  registerPosthook,
  PosthookPlugin,
  SimpleStyleRules,
  createStyles,
} from '../src';

import {
  getPosthooks,
} from '../src/plugins';

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
    const posthook: PosthookPlugin = jest.fn((sheetContents) => {
      expect(sheetContents.length).toBeGreaterThan(0);
      expect(sheetContents.startsWith('.posthook')).toBeTruthy();
      expect(sheetContents).toContain('{background-size:contain;background-repeat:no-repeat;}');
      return sheetContents;
    });
    registerPosthook(posthook);
    createStyles(rules);
    expect(posthook).toBeCalled();
  });
  it('Should execture a posthook and transform the contents', () => {
    const rules: SimpleStyleRules = {
      posthook: {
        userSelect: 'none',
      },
    };
    const posthook: PosthookPlugin = sheetContents => postcss([autoprefixer()]).process(sheetContents).css;
    registerPosthook(posthook);
    const [styles, sheetContents] = createStyles(rules);
    expect(sheetContents).toBe(`.${styles.posthook}{-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;}`);
  });
});
