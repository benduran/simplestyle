import type { Properties } from 'csstype';
import { createStyles, keyframes, rawStyles } from './createStyles.js';
import type { SimpleStyleRegistry } from './simpleStyleRegistry.js';
import type { SimpleStyleRules, SimpleStyleVariables } from './types.js';

export function makeKeyframes(registry?: SimpleStyleRegistry) {
  return function wrappedCreateKeyframes<T extends Record<string, Properties>>(
    ruleId: string,
    rules: T,
  ) {
    return keyframes<T>(ruleId, rules, { registry });
  };
}

export function makeCreateStyles(registry?: SimpleStyleRegistry) {
  return function wrappedCreateStyles<
    T extends SimpleStyleRules,
    K extends keyof T,
    O extends Record<K, string>,
  >(ruleId: string, rules: T) {
    return createStyles<T, K, O>(ruleId, rules, { registry });
  };
}

export function makeRawStyles(registry?: SimpleStyleRegistry) {
  return function wrappedRawStyles<T extends SimpleStyleRules>(
    ruleId: string,
    rules: T,
  ) {
    return rawStyles<T>(ruleId, rules, { registry });
  };
}

type MakeCssFuncsOpts<T extends SimpleStyleVariables> = {
  registry?: SimpleStyleRegistry;
  variables: T;
};

/**
 * Creates all of your CSS functions, createStyles, keframes and rawStyles,
 * and scopes them all to your registry and variables definitions (both are optional).
 * The variants of these functions differ slightly, in that
 * they accept a function as the 2nd parameter, instead of the usual object.
 * The function will be provided with your variables
 */
export function makeCssFuncs<V extends SimpleStyleVariables>({
  registry,
  variables,
}: MakeCssFuncsOpts<V>) {
  function wrappedCreateStyles<
    T extends SimpleStyleRules,
    K extends keyof T,
    O extends Record<K, string>,
  >(ruleId: string, rulesFnc: (vars: V) => T) {
    return createStyles<T, K, O>(ruleId, rulesFnc(variables), { registry });
  }
  function wrappedCreateKeyframes<T extends Record<string, Properties>>(
    ruleId: string,
    rulesFnc: (vars: V) => T,
  ) {
    return keyframes<T>(ruleId, rulesFnc(variables), { registry });
  }

  function wrappedRawStyles<T extends SimpleStyleRules>(
    ruleId: string,
    rulesFnc: (vars: V) => T,
  ) {
    return rawStyles<T>(ruleId, rulesFnc(variables), { registry });
  }

  return {
    createStyles: wrappedCreateStyles,
    keyframes: wrappedCreateKeyframes,
    rawStyles: wrappedRawStyles,
  };
}
