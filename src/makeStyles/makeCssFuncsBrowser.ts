import type { Properties } from 'csstype';
import { createImports } from './createImports.js';
import { createKeyframes } from './createKeyframes.js';
import { createRawStyles } from './createRawStyles.js';
import { createStyles } from './createStyles.js';
import { addClassnameCountsMap } from './generateClassName.js';
import type {
  CreateStylesOptions,
  ImportStringType,
  MakeCssFuncsOpts,
  SimpleStyleRules,
} from './types.js';

function extractOverridesAndOpts<T extends object | undefined | null>(
  opts?: MakeCssFuncsOpts<T>,
  overrides?: CreateStylesOptions,
) {
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
>(initialOpts?: MakeCssFuncsOpts<V>) {
  type RulesCallback<ReturnType> = (
    vars: V extends undefined | null | never ? never : V,
  ) => ReturnType;

  const mapId = performance.now().toString();
  addClassnameCountsMap(mapId);

  function wrappedCreateStyles<
    T extends SimpleStyleRules,
    K extends keyof T,
    O extends Record<K, string>,
  >(
    ruleId: string,
    rulesFnc: RulesCallback<T>,
    overrides?: CreateStylesOptions,
  ) {
    return createStyles<T, K, O>(
      mapId,
      ruleId,
      () => {
        const opts = extractOverridesAndOpts(initialOpts, overrides);
        return rulesFnc(
          // @ts-expect-error - this is a safe operation, even if tsc gets confused right here
          ('variables' in opts ? opts.variables : undefined) as V,
        );
      },
      { ...initialOpts, ...overrides },
    );
  }
  function wrappedCreateKeyframes<T extends Record<string, Properties>>(
    ruleId: string,
    rulesFnc: RulesCallback<T>,
    overrides?: CreateStylesOptions,
  ) {
    return createKeyframes<T>(
      mapId,
      ruleId,
      () => {
        const opts = extractOverridesAndOpts(initialOpts, overrides);
        return rulesFnc(
          // @ts-expect-error - this is a safe operation, even if tsc gets confused right here
          ('variables' in opts ? opts.variables : undefined) as V,
        );
      },
      {
        ...initialOpts,
        ...overrides,
      },
    );
  }

  function wrappedRawStyles<T extends SimpleStyleRules>(
    ruleId: string,
    rulesFnc: RulesCallback<T>,
    overrides?: CreateStylesOptions,
  ) {
    return createRawStyles<T>(
      mapId,
      ruleId,
      () => {
        const opts = extractOverridesAndOpts(initialOpts, overrides);
        return rulesFnc(
          // @ts-expect-error - this is a safe operation, even if tsc gets confused right here
          ('variables' in opts ? opts.variables : undefined) as V,
        );
      },
      {
        ...initialOpts,
        ...overrides,
      },
    );
  }

  function wrappedImports(
    ruleId: string,
    rulesFnc: RulesCallback<ImportStringType[]>,
    overrides?: CreateStylesOptions,
  ) {
    return createImports(
      ruleId,
      () => {
        const opts = extractOverridesAndOpts(initialOpts, overrides);
        return rulesFnc(
          // @ts-expect-error - this is a safe operation, even if tsc gets confused right here
          ('variables' in opts ? opts.variables : undefined) as V,
        );
      },
      {
        ...initialOpts,
        ...overrides,
      },
    );
  }

  return {
    createStyles: wrappedCreateStyles,
    createImports: wrappedImports,
    createKeyframes: wrappedCreateKeyframes,
    createRawStyles: wrappedRawStyles,
  };
}
