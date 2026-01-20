import type { Properties } from 'csstype';
import { createImports } from '../makeStyles/createImports.js';
import { createKeyframes } from '../makeStyles/createKeyframes.js';
import { createRawStyles } from '../makeStyles/createRawStyles.js';
import { createStyles } from '../makeStyles/createStyles.js';
import { addClassnameCountsMap } from '../makeStyles/generateClassName.js';
import type {
  CreateStylesOptions,
  ImportStringType,
  MakeCssFuncsOpts,
  SimpleStyleRules,
} from '../makeStyles/types.js';

const lockedSSROpts: CreateStylesOptions = {
  flush: false,
  insertAfter: null,
  insertBefore: null,
};

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
 * SSR variant of makeCssFuncs.
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
  >(ruleId: string, rulesFnc: RulesCallback<T>) {
    const opts = extractOverridesAndOpts(initialOpts);

    return createStyles<T, K, O>(
      mapId,
      ruleId,
      () => {
        return rulesFnc(
          // @ts-expect-error - this is a safe operation, even if tsc gets confused right here
          ('variables' in opts ? opts.variables : undefined) as V,
        );
      },
      lockedSSROpts,
    );
  }
  function wrappedCreateKeyframes<T extends Record<string, Properties>>(
    ruleId: string,
    rulesFnc: RulesCallback<T>,
  ) {
    const opts = extractOverridesAndOpts(initialOpts);

    return createKeyframes<T>(
      mapId,
      ruleId,
      () => {
        return rulesFnc(
          // @ts-expect-error - this is a safe operation, even if tsc gets confused right here
          ('variables' in opts ? opts.variables : undefined) as V,
        );
      },
      lockedSSROpts,
    );
  }

  function wrappedRawStyles<T extends SimpleStyleRules>(
    ruleId: string,
    rulesFnc: RulesCallback<T>,
  ) {
    const opts = extractOverridesAndOpts(initialOpts);

    return createRawStyles<T>(
      mapId,
      ruleId,
      () => {
        return rulesFnc(
          // @ts-expect-error - this is a safe operation, even if tsc gets confused right here
          ('variables' in opts ? opts.variables : undefined) as V,
        );
      },
      lockedSSROpts,
    );
  }

  function wrappedImports(
    ruleId: string,
    rulesFnc: RulesCallback<ImportStringType[]>,
  ) {
    const opts = extractOverridesAndOpts(initialOpts);

    return createImports(
      ruleId,
      () => {
        return rulesFnc(
          // @ts-expect-error - this is a safe operation, even if tsc gets confused right here
          ('variables' in opts ? opts.variables : undefined) as V,
        );
      },
      lockedSSROpts,
    );
  }

  return {
    createStyles: wrappedCreateStyles,
    createImports: wrappedImports,
    createKeyframes: wrappedCreateKeyframes,
    createRawStyles: wrappedRawStyles,
  };
}

export * from '../makeStyles/types.js';
