import autoprefixer from 'autoprefixer';
import postcss from 'postcss';
import { Properties } from 'csstype';

import {
  registerPrehook,
  registerPosthook,
  PrehookPlugin,
  PosthookPlugin,
  SimpleStyleRules,
  createStyles,
} from '../src';

import {
  getPrehooks, getPosthooks,
} from '../src/plugins';

describe('Plugin hooks', () => {
  beforeEach(() => {
    Array.from(document.head.querySelectorAll('style')).forEach(s => s.remove());
    getPrehooks().length = 0;
    getPosthooks().length = 0;
  });
  it('Should execute a prehook with the proper arguments', () => {
    const rules: SimpleStyleRules = {
      pluginTest: {
        backgroundColor: 'purple',
        fontFamily: 'sans-serif',
      },
    };
    const prehook: PrehookPlugin = jest.fn((toRender) => {
      expect(toRender).toBeDefined();
      const out: Properties = toRender[Object.keys(toRender).find(k => k.startsWith('.pluginTest')) || ''];
      expect(out).toBeDefined();
      expect(out.backgroundColor).toBe(rules.pluginTest.backgroundColor);
      expect(out.fontFamily).toBe(rules.pluginTest.fontFamily);
      return toRender;
    });
    registerPrehook(prehook);
    createStyles(rules);
    expect(prehook).toBeCalled();
  });
  it('Should execute a prehook and validate that props are added', () => {
    const rules: SimpleStyleRules = {
      pluginTest: {
        transform: 'translateY(-50%)',
      },
    };
    const prehook: PrehookPlugin = jest.fn(toRender => Object.entries(toRender).reduce((prev, [key, obj]) => ({ ...prev, [key]: { ...obj, '-webkit-transform': (obj as Properties).transform } } as typeof toRender), toRender));
    registerPrehook(prehook);
    const [styles, sheetContents] = createStyles(rules);
    expect(prehook).toBeCalled();
    expect(sheetContents).toBe(`.${styles.pluginTest}{transform:translateY(-50%);-webkit-transform:translateY(-50%);}`);
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
    const [styles] = createStyles(rules);
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
