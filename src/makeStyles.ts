import type { Properties } from 'csstype';
import {
  type CreateStylesOptions,
  createStyles,
  imports,
  keyframes,
  rawStyles,
} from './createStyles.js';
import type { SimpleStyleRegistry } from './simpleStyleRegistry.js';
import type { ImportStringType, Nullish, SimpleStyleRules } from './types.js';

type MakeCssFuncsOpts<T extends object | undefined | null> =
  | {
      registry?: Nullish<SimpleStyleRegistry>;
      variables?: T;
    }
  | (() => {
      registry?: Nullish<SimpleStyleRegistry>;
      variables?: T;
    });

function extractOverridesAndOpts<T extends object | undefined | null>(
  optsOrCallback: MakeCssFuncsOpts<T>,
  overridesOrCallback?: CreateStylesOptions,
) {
  const opts =
    typeof optsOrCallback === 'function' ? optsOrCallback() : optsOrCallback;
  const overrides =
    typeof overridesOrCallback === 'function'
      ? overridesOrCallback()
      : overridesOrCallback;

  return {
    ...opts,
    ...overrides,
  };
}

/**
 * Creates all of your CSS functions, createStyles, keframes and rawStyles,
 * and scopes them all to your registry and variables definitions (both are optional).
 * The variants of these functions differ slightly, in that
 * they accept a function as the 2nd parameter, instead of the usual object.
 * The function will be provided with your variables
 */
export function makeCssFuncs<
  V extends object | undefined | null | never = never,
>(optsOrCallback: MakeCssFuncsOpts<V>) {
  type RulesCallback<ReturnType> = (
    vars: V extends undefined | null | never ? never : V,
  ) => ReturnType;

  function wrappedCreateStyles<
    T extends SimpleStyleRules,
    K extends keyof T,
    O extends Record<K, string>,
  >(
    ruleId: string,
    rulesFnc: RulesCallback<T>,
    overridesOrCallback?: CreateStylesOptions,
  ) {
    return createStyles<T, K, O>(
      ruleId,
      () => {
        const opts = extractOverridesAndOpts(
          optsOrCallback,
          overridesOrCallback,
        );
        return rulesFnc(
          // @ts-expect-error - this is a safe operation, even if tsc gets confused right here
          ('variables' in opts ? opts.variables : undefined) as V,
        );
      },
      () => extractOverridesAndOpts(optsOrCallback, overridesOrCallback),
    );
  }
  function wrappedCreateKeyframes<T extends Record<string, Properties>>(
    ruleId: string,
    rulesFnc: RulesCallback<T>,
    overridesOrCallback?: CreateStylesOptions,
  ) {
    return keyframes<T>(
      ruleId,
      () => {
        const opts = extractOverridesAndOpts(
          optsOrCallback,
          overridesOrCallback,
        );
        return rulesFnc(
          // @ts-expect-error - this is a safe operation, even if tsc gets confused right here
          ('variables' in opts ? opts.variables : undefined) as V,
        );
      },
      () => extractOverridesAndOpts(optsOrCallback, overridesOrCallback),
    );
  }

  function wrappedRawStyles<T extends SimpleStyleRules>(
    ruleId: string,
    rulesFnc: RulesCallback<T>,
    overridesOrCallback?: CreateStylesOptions,
  ) {
    return rawStyles<T>(
      ruleId,
      () => {
        const opts = extractOverridesAndOpts(
          optsOrCallback,
          overridesOrCallback,
        );
        return rulesFnc(
          // @ts-expect-error - this is a safe operation, even if tsc gets confused right here
          ('variables' in opts ? opts.variables : undefined) as V,
        );
      },
      () => extractOverridesAndOpts(optsOrCallback, overridesOrCallback),
    );
  }

  function wrappedImports(
    ruleId: string,
    rulesFnc: RulesCallback<ImportStringType[]>,
    overridesOrCallback?: CreateStylesOptions,
  ) {
    return imports(
      ruleId,
      () => {
        const opts = extractOverridesAndOpts(
          optsOrCallback,
          overridesOrCallback,
        );
        return rulesFnc(
          // @ts-expect-error - this is a safe operation, even if tsc gets confused right here
          ('variables' in opts ? opts.variables : undefined) as V,
        );
      },
      () => extractOverridesAndOpts(optsOrCallback, overridesOrCallback),
    );
  }

  return {
    createStyles: wrappedCreateStyles,
    imports: wrappedImports,
    keyframes: wrappedCreateKeyframes,
    rawStyles: wrappedRawStyles,
  };
}
