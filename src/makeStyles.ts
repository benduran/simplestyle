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
  localRegistryOverride: Nullish<SimpleStyleRegistry>,
  overridesOrCallback?: CreateStylesOptions,
) {
  const opts =
    typeof optsOrCallback === 'function' ? optsOrCallback() : optsOrCallback;
  const overrides =
    typeof overridesOrCallback === 'function'
      ? overridesOrCallback()
      : overridesOrCallback;

  const out = {
    ...opts,
    ...overrides,
  };

  if (localRegistryOverride) out.registry = localRegistryOverride;

  return out;
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

  let localRegistryOverride: Nullish<SimpleStyleRegistry> = null;

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
          localRegistryOverride,
          overridesOrCallback,
        );
        return rulesFnc(
          // @ts-expect-error - this is a safe operation, even if tsc gets confused right here
          ('variables' in opts ? opts.variables : undefined) as V,
        );
      },
      () =>
        extractOverridesAndOpts(
          optsOrCallback,
          localRegistryOverride,
          overridesOrCallback,
        ),
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
          localRegistryOverride,
          overridesOrCallback,
        );
        return rulesFnc(
          // @ts-expect-error - this is a safe operation, even if tsc gets confused right here
          ('variables' in opts ? opts.variables : undefined) as V,
        );
      },
      () =>
        extractOverridesAndOpts(
          optsOrCallback,
          localRegistryOverride,
          overridesOrCallback,
        ),
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
          localRegistryOverride,
          overridesOrCallback,
        );
        return rulesFnc(
          // @ts-expect-error - this is a safe operation, even if tsc gets confused right here
          ('variables' in opts ? opts.variables : undefined) as V,
        );
      },
      () =>
        extractOverridesAndOpts(
          optsOrCallback,
          localRegistryOverride,
          overridesOrCallback,
        ),
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
          localRegistryOverride,
          overridesOrCallback,
        );
        return rulesFnc(
          // @ts-expect-error - this is a safe operation, even if tsc gets confused right here
          ('variables' in opts ? opts.variables : undefined) as V,
        );
      },
      () =>
        extractOverridesAndOpts(
          optsOrCallback,
          localRegistryOverride,
          overridesOrCallback,
        ),
    );
  }

  /**
   * this is a useful function to use if you are building a component library
   * that is installed / shared in other packages, and these packages that
   * use your component library are server-side rendered.
   * this function should be called as the very first thing before any of your
   * other component code is loaded, as this will ensure your CSS registry
   * is clamped to the instance you need
   */
  const setRegistryOverride = (registry: Nullish<SimpleStyleRegistry>) => {
    localRegistryOverride = registry;
  };

  return {
    createStyles: wrappedCreateStyles,
    imports: wrappedImports,
    keyframes: wrappedCreateKeyframes,
    rawStyles: wrappedRawStyles,
    setRegistryOverride,
  };
}
