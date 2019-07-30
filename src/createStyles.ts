
import createClassName from './createClassName';
import formatCssRule from './formatCssRule';
import * as sheetCache from './sheetCache';
import SimpleStylesheet from './simpleStylesheet';
import { ISimpleStyleRules } from './styleTypes';

// TODO: The order of operations here doesn't "feel" right, but it is working for now.

function formatRules<T>(
  sheet: SimpleStylesheet,
  flush: boolean,
  rules: ISimpleStyleRules<T>,
  parentSelector?: string,
): string {
  const ruleKeys = Object.keys(rules);
  const nestedStyleKeys = ruleKeys.filter(rk => typeof rules[rk] === 'object');
  if (parentSelector && nestedStyleKeys.length) {
    createStylesImpl(
      nestedStyleKeys.reduce((prev: ISimpleStyleRules<T>, rk: string) => Object.assign(prev, { [rk]: rules[rk] }), {}),
      flush,
      new Date().getTime(),
      sheet,
      parentSelector,
    );
  }
  return ruleKeys.reduce((prev: string, selectorOrRule: string) => {
    if (selectorOrRule.startsWith('&') || typeof rules[selectorOrRule] === 'object') return prev;
    const formattedRule = formatCssRule(selectorOrRule);
    return `${prev}${formattedRule}:${rules[selectorOrRule]};`;
  }, '');
}

function createStylesImpl<
  T extends { [classKey: string]: ISimpleStyleRules<T> },
  K extends keyof T,
  O extends { [classKey in K]: string }
>(
  styles: T,
  flush: boolean,
  seed: number = new Date().getTime(),
  sheetOverride: SimpleStylesheet | null = null,
  parentSelector: string | null = null,
): O {
  let tseed = seed;
  const sheet = sheetOverride || new SimpleStylesheet();
  if (parentSelector === null) sheetCache.add(sheet);
  const out: O = Object.keys(styles).reduce(
    (prev: O, classKey: string) => {
      const classname = parentSelector ? classKey.replace(/&/g, parentSelector) : createClassName(tseed++, classKey);
      const selector = parentSelector ? classname : `.${classname}`;
      sheet.addRule(classKey, selector, formatRules(sheet, flush, styles[classKey]), parentSelector === null);
      formatRules(sheet, flush, styles[classKey], selector);
      return Object.assign(prev, {
        [classKey]: classname,
      });
    },
    {} as O,
  );
  sheet.updateNestedSelectors();
  if (parentSelector === null && flush) sheet.attach();
  return out;
}

export default function createStyles<
  T extends { [classKey: string]: ISimpleStyleRules<T> },
  K extends keyof T,
  O extends { [classKey in K]: string }
>(
  styles: T,
  flush: boolean = true,
  seed: number = new Date().getTime(),
): O {
  return createStylesImpl<T, K, O>(styles, flush, seed);
}
