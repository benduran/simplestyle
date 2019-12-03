/* tslint:disable no-console */

import autoprefixer from 'autoprefixer';
import postcss from 'postcss';

import createStyles, { registerPreHook } from '../src';
import { clearPostHooks, clearPreHooks, getPostHooks, getPreHooks, registerPostHook } from '../src/pluginHooks';
import globalSheetCache from '../src/sheetCache';
import SimpleStylesheet from '../src/simpleStylesheet';
import { SimpleStylePluginPostHook, SimpleStylePluginPreHook } from '../src/styleTypes';

function generatePreHooks(count: number) {
  const preHooks: SimpleStylePluginPreHook[] = [];
  for (let i = 0; i < count; i++) preHooks.push(jest.fn((s, r) => { console.info('pre hook number', i); return r; }));
  return preHooks;
}
function generatePostHooks(count: number) {
  const postHooks: SimpleStylePluginPostHook[] = [];
  for (let i = 0; i < count; i++) postHooks.push(jest.fn((s, r) => { console.info('post hook number', i); return r; }));
  return postHooks;
}

describe('Plugin hooks registration and execution', () => {
  beforeEach(() => {
    globalSheetCache.clean();
    clearPreHooks();
    clearPostHooks();
  });
  it('Should register a pre hook', () => {
    const preHook: SimpleStylePluginPreHook = (s, r) => r;
    registerPreHook(preHook);
    expect(getPreHooks().length).toBe(1);
    expect(getPreHooks()).toContain(preHook);
    expect(getPostHooks().length).toBe(0);
  });
  it('Should register a post hook', () => {
    const postHook: SimpleStylePluginPostHook = (s, r) => r;
    registerPostHook(postHook);
    expect(getPostHooks().length).toBe(1);
    expect(getPostHooks()).toContain(postHook);
    expect(getPreHooks().length).toBe(0);
  });
  it('Prehook should accept the correct arguments', () => {
    const r = {
      preHookRoot: {
        backgroundColor: 'yellow',
        position: 'absolute',
      },
    };
    const preHook: SimpleStylePluginPreHook = jest.fn((s, rules, sheetCache) => {
      const styles = s.getStyles();
      expect(s).toBeInstanceOf(SimpleStylesheet);
      expect(styles.length).toBe(0);
      expect(rules).toBe(r.preHookRoot);
      expect(sheetCache.getAll().length).toBe(1);
      expect(typeof sheetCache.add).toBe('function');
      expect(typeof sheetCache.clean).toBe('function');
      return rules;
    });
    registerPreHook(preHook);
    createStyles(r as any);
    expect(preHook).toBeCalled();
  });
  it('Posthook should accept the correct arguments', () => {
    const r = {
      postHookRoot: {
        backgroundColor: 'pink',
        width: '50%',
      },
    };
    const postHook: SimpleStylePluginPostHook = jest.fn((s, rules, className, sheetCache) => {
      const styles = s.getStyles();
      expect(s).toBeInstanceOf(SimpleStylesheet);
      expect(styles.length).toBeGreaterThan(1);
      expect(styles).toContain('.postHookRoot');
      expect(styles).toContain('background-color:pink;');
      expect(styles).toContain('width:50%;');
      expect(rules).toBe(r.postHookRoot);
      expect(className).toContain('postHookRoot');
      expect(sheetCache.getAll().length).toBe(1);
      expect(typeof sheetCache.add).toBe('function');
      expect(typeof sheetCache.clean).toBe('function');
    });
    registerPostHook(postHook);
    createStyles(r as any);
    expect(postHook).toBeCalled();
  });
  it('Should register multiple pre and post hooks', () => {
    const preHooks = generatePreHooks(5);
    const postHooks = generatePostHooks(8);
    preHooks.forEach(p => registerPreHook(p));
    postHooks.forEach(p => registerPostHook(p));
    const registeredPreHooks = getPreHooks();
    const registeredPostHooks = getPostHooks();

    expect(registeredPreHooks.length).toBe(preHooks.length);
    expect(registeredPostHooks.length).toBe(postHooks.length);
    registeredPreHooks.forEach((p, i) => expect(p).toBe(preHooks[i]));
    registeredPostHooks.forEach((p, i) => expect(p).toBe(postHooks[i]));
  });
  it('Should validate that each prehook transforms the rules properly', () => {
    const r = {
      preHookRoot: {
        boxSizing: 'border-box',
      },
    };
    const preHook1: SimpleStylePluginPreHook = jest.fn((s, rules, sc) => {
      if (rules.boxSizing) rules['-webkit-box-sizing'] = rules.boxSizing;
      return rules;
    });
    const preHook2: SimpleStylePluginPreHook = jest.fn((s, rules, sc) => {
      if (rules['-webkit-box-sizing']) rules['-moz-box-sizing'] = rules.boxSizing;
      return rules;
    });
    const preHook3: SimpleStylePluginPreHook = jest.fn((s, rules, sc) => {
      if (rules['-webkit-box-sizing'] && rules['-moz-box-sizing']) rules['-ms-box-sizing'] = rules.boxSizing;
      return rules;
    });
    registerPreHook(preHook1);
    registerPreHook(preHook2);
    registerPreHook(preHook3);
    const styles = createStyles(r as any, false);
    const [sheet] = globalSheetCache.getAll();
    const rendered = sheet.getStyles();
    expect(preHook1).toBeCalled();
    expect(preHook2).toBeCalled();
    expect(preHook3).toBeCalled();
    expect(rendered).toContain(`.${styles.preHookRoot}`);
    expect(rendered).toContain('box-sizing:border-box;');
    expect(rendered).toContain('-webkit-box-sizing:border-box;');
    expect(rendered).toContain('-moz-box-sizing:border-box;');
    expect(rendered).toContain('-ms-box-sizing:border-box;');
  });
  it('Should validate that the posthook transform the rules properly', () => {
    const r = {
      postHookRoot: {
        userSelect: 'none',
      },
    };
    const posthook1: SimpleStylePluginPostHook = jest.fn((s, rules, generatedSelector) => {
      s.sheetBuffer = postcss([autoprefixer()]).process(s.getStyles()).css;
    });
    registerPostHook(posthook1);
    createStyles(r as any, false);
    const [sheet] = globalSheetCache.getAll();
    const rendered = sheet.getStyles();
    expect(posthook1).toBeCalled();
    expect(rendered).toContain('user-select:none;');
    expect(rendered).toContain('-webkit-user-select:none;');
    expect(rendered).toContain('-moz-user-select:none;');
    expect(rendered).toContain('-ms-user-select:none;');
  });
});
