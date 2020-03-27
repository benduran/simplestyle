
import { Properties } from 'csstype';

import { SimpleStyleRules } from './types';
import generateClassName from './generateClassName';

export interface CreateStylesOptions {
  accumulate: boolean;
  flush: boolean;
}

function isNestedSelector(r: string): boolean {
  return /&/g.test(r);
}

function formatCSSRuleName(rule: string): string {
  return rule.replace(/([A-Z])/g, p1 => `-${p1.toLowerCase()}`);
}

function formatCSSRules(cssRules: Properties): string {
  return Object.entries(cssRules).reduce((prev, [cssProp, cssVal]) => `${formatCSSRuleName(cssProp)}:${cssVal};`, '');
}

type ParentSelector = string | null;

function execCreateStyles<
  T extends SimpleStyleRules,
  K extends keyof T,
  O extends { [classKey in K]: string },
>(
  rules: T,
  options: CreateStylesOptions,
  parentSelector: ParentSelector,
): [O, string] {
  let sheetContents = '';
  const out = {} as O;
  const styleEntries = Object.entries(rules);
  for (const [classNameOrCSSRule, classNameRules] of styleEntries) {
    // if the classNameRules is a string, we are dealing with a display: none; type rule
    if (typeof classNameRules === 'string') {
      sheetContents += `${formatCSSRuleName(classNameOrCSSRule)}:${classNameRules};`;
    } else if (isNestedSelector(classNameOrCSSRule)) {
      if (!parentSelector) throw new Error('Unablet to generate nested rule because parentSelector is missing');
      // format of { '& > span': { display: 'none' } } (or further nesting)
      const replaced = classNameOrCSSRule.replace(/&/g, parentSelector);
      sheetContents += `${replaced}{${execCreateStyles(classNameRules as T, options, replaced)[1]}}`;
    } else if (!parentSelector && typeof classNameRules === 'object') {
      const generated = generateClassName(classNameOrCSSRule);
      (out as any)[classNameOrCSSRule] = generated;
      sheetContents += `.${generated}{${execCreateStyles(classNameRules as T, options, generated)[1]}}`;
    }
  }
  return [out, sheetContents];
}

export default function createStyles<
  T extends SimpleStyleRules,
  K extends keyof T,
  O extends { [classKey in K]: string },
>(
  rules: T,
  options?: Partial<CreateStylesOptions>,
): [O, string] {
  const coerced: CreateStylesOptions = {
    accumulate: options?.accumulate || false,
    flush: options?.flush || true,
  };
  return execCreateStyles<T, K, O>(rules, coerced, null);
}

export type CreateStylesArgs = Parameters<typeof createStyles>;
