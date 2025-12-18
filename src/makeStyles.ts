import type { Properties } from 'csstype';
import {
  type CreateStylesOptions,
  createStyles,
  imports,
  keyframes,
  rawStyles,
} from './createStyles.js';
import type { SimpleStyleRegistry } from './simpleStyleRegistry.js';
import type { ImportStringType, SimpleStyleRules } from './types.js';

type MakeCssFuncsOpts<T extends object> =
  | {}
  | {
      registry: SimpleStyleRegistry;
    }
  | {
      variables: T;
    }
  | {
      registry: SimpleStyleRegistry;
      variables: T;
    };

/**
 * Creates all of your CSS functions, createStyles, keframes and rawStyles,
 * and scopes them all to your registry and variables definitions (both are optional).
 * The variants of these functions differ slightly, in that
 * they accept a function as the 2nd parameter, instead of the usual object.
 * The function will be provided with your variables
 */
export function makeCssFuncs<V extends object>(opts: MakeCssFuncsOpts<V>) {
  function wrappedCreateStyles<
    T extends SimpleStyleRules,
    K extends keyof T,
    O extends Record<K, string>,
  >(
    ruleId: string,
    rulesFnc: (vars?: V) => T,
    overrides?: CreateStylesOptions,
  ) {
    return createStyles<T, K, O>(
      ruleId,
      () => rulesFnc('variables' in opts ? opts.variables : undefined),
      {
        ...overrides,
        registry: 'registry' in opts ? opts.registry : overrides?.registry,
      },
    );
  }
  function wrappedCreateKeyframes<T extends Record<string, Properties>>(
    ruleId: string,
    rulesFnc: (vars?: V) => T,
    overrides?: CreateStylesOptions,
  ) {
    return keyframes<T>(
      ruleId,
      () => rulesFnc('variables' in opts ? opts.variables : undefined),
      {
        ...overrides,
        registry: 'registry' in opts ? opts.registry : overrides?.registry,
      },
    );
  }

  function wrappedRawStyles<T extends SimpleStyleRules>(
    ruleId: string,
    rulesFnc: (vars?: V) => T,
    overrides?: CreateStylesOptions,
  ) {
    return rawStyles<T>(
      ruleId,
      () => rulesFnc('variables' in opts ? opts.variables : undefined),
      {
        ...overrides,
        registry: 'registry' in opts ? opts.registry : overrides?.registry,
      },
    );
  }

  function wrappedImports(
    ruleId: string,
    rulesFnc: (vars?: V) => ImportStringType[],
    overrides?: CreateStylesOptions,
  ) {
    return imports(
      ruleId,
      () => rulesFnc('variables' in opts ? opts.variables : undefined),
      {
        ...overrides,
        registry: 'registry' in opts ? opts.registry : overrides?.registry,
      },
    );
  }

  return {
    createStyles: wrappedCreateStyles,
    imports: wrappedImports,
    keyframes: wrappedCreateKeyframes,
    rawStyles: wrappedRawStyles,
  };
}
