/* eslint-disable no-param-reassign */
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
  return Object.entries(cssRules).reduce((prev, [cssProp, cssVal]) => `${prev}${formatCSSRuleName(cssProp)}:${cssVal};`, '');
}

type ParentSelector = string | null;

function execCreateStyles<
  T extends SimpleStyleRules,
  K extends keyof T,
  O extends { [classKey in K]: string },
  O2 extends SimpleStyleRules,
>(
  rules: T,
  options: CreateStylesOptions,
  parentSelector: ParentSelector,
): [O, O2] {
  const out = {} as O;
  let toRender = {} as O2;
  const styleEntries = Object.entries(rules);
  for (const [classNameOrCSSRule, classNameRules] of styleEntries) {
    // if the classNameRules is a string, we are dealing with a display: none; type rule
    if (isNestedSelector(classNameOrCSSRule)) {
      if (!parentSelector) throw new Error('Unable to generate nested rule because parentSelector is missing');
      // format of { '& > span': { display: 'none' } } (or further nesting)
      const replaced = classNameOrCSSRule.replace(/&/g, parentSelector);
      toRender = { ...toRender, ...execCreateStyles(classNameRules as T, options, replaced)[1] };
    } else if (!parentSelector && typeof classNameRules === 'object') {
      const generated = generateClassName(classNameOrCSSRule);
      (out as any)[classNameOrCSSRule] = generated;
      toRender = { ...execCreateStyles(classNameRules as T, options, `.${generated}`)[1], ...toRender };
    } else {
      if (!parentSelector) throw new Error('Unable to write css props because parent selector is null');
      if (!(toRender as any)[parentSelector]) (toRender as any)[parentSelector] = {};
      (toRender as any)[parentSelector][classNameOrCSSRule] = classNameRules;
    }
  }
  return [out, toRender];
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
  const [out, toRender] = execCreateStyles<T, K, O, { [selector: string]: Properties }>(rules, coerced, null);
  return [
    out,
    Object.entries(toRender).reduce((prev, [selector, props]) => `${prev}${selector}{${formatCSSRules(props)}}`, ''),
  ];
}

export type CreateStylesArgs = Parameters<typeof createStyles>;
