
import * as seed from './clasnameSeed';
import createClassName from './createClassName';
import formatCssRule from './formatCssRule';
import { getPostHooks, getPreHooks } from './pluginHooks';
import sheetCache from './sheetCache';
import SimpleStylesheet from './simpleStylesheet';
import { ISimpleStyleRules } from './styleTypes';

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

function formatClassName(
  s: number,
  classKey: string,
  parentSelector: string | null,
  isMedia: boolean,
): string {
  if (parentSelector) {
    if (isMedia) return parentSelector;
    const sParentSelector = parentSelector.split(',');
    // Handle the magic case from this issue regarding comma-separate parents: https://github.com/benduran/simplestyle/issues/8
    if (sParentSelector.length > 1) return sParentSelector.map(pSelector => classKey.replace(/&/g, pSelector)).join(',');
    return classKey.replace(/&/g, parentSelector);
  }
  return createClassName(s, classKey);
}

function createStylesImpl<
  T extends { [classKey: string]: ISimpleStyleRules<T> },
  K extends keyof T,
  O extends { [classKey in K]: string }
>(
  styles: T,
  flush: boolean,
  sheetOverride: SimpleStylesheet | null = null,
  parentSelector: string | null = null,
): O {
  const sheet = sheetOverride || new SimpleStylesheet();
  if (parentSelector === null) sheetCache.add(sheet);
  const out: O = Object.keys(styles).reduce(
    (prev: O, classKey: string) => {
      let preProcessedRules: ISimpleStyleRules<T> = styles[classKey];
      getPreHooks().forEach((p) => {
        preProcessedRules = p<T>(sheet, preProcessedRules, sheetCache);
      });
      const isMedia = classKey.startsWith('@media');
      const s = seed.get();
      seed.increment();
      const classname = formatClassName(s, classKey, parentSelector, isMedia);
      const selector = parentSelector ? isMedia ? parentSelector : classname : `.${classname}`;
      if (isMedia) {
        sheet.startMedia(classKey);
        sheet.addRule(selector, selector, formatRules(sheet, flush, preProcessedRules), false);
      } else sheet.addRule(classKey, selector, formatRules(sheet, flush, preProcessedRules), parentSelector === null);
      formatRules(sheet, flush, preProcessedRules, selector);
      if (isMedia) sheet.stopMedia();
      getPostHooks().forEach(p => p<T>(sheet, preProcessedRules, classname, sheetCache));
      return Object.assign(prev, {
        [classKey]: classname,
      });
    },
    {} as O,
  );
  sheet.updateNestedSelectors();
  if (parentSelector === null && flush) {
    sheet.attach();
    sheet.cleanup();
  }
  return out;
}

export default function createStyles<
  T extends { [classKey: string]: ISimpleStyleRules<T> },
  K extends keyof T,
  O extends { [classKey in K]: string }
>(
  styles: T,
  flush: boolean = true,
): O {
  return createStylesImpl<T, K, O>(styles, flush);
}
