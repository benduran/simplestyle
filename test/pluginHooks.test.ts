
import createStyles, { registerPreHook } from '../src';
import { clearPostHooks, clearPreHooks, getPostHooks, getPreHooks, registerPostHook } from '../src/pluginHooks';
import SimpleStylesheet from '../src/simpleStylesheet';
import { SimpleStylePluginPostHook, SimpleStylePluginPreHook } from '../src/styleTypes';

describe('Plugin hooks registration and execution', () => {
  beforeEach(() => {
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
    const preHook: SimpleStylePluginPreHook = jest.fn((s, rules) => {
      const styles = s.getStyles();
      expect(s).toBeInstanceOf(SimpleStylesheet);
      expect(styles.length).toBe(0);
      expect(rules).toBe(r.preHookRoot);
      return rules;
    });
    registerPreHook(preHook);
    createStyles(r as any);
    expect(preHook).toBeCalled();
  });
});
