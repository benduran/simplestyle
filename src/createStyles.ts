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

function isMedia(r: string): boolean {
  return r.toLowerCase().startsWith('@media');
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
  O2 extends SimpleStyleRules & { [selector: string]: Properties[] },
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
    if (isMedia(classNameOrCSSRule)) {
      if (typeof classNameRules !== 'object') throw new Error('Unable to map @media query because rules / props are an invalid type');
      toRender = { ...toRender, [classNameOrCSSRule]: execCreateStyles(classNameRules as T, options, parentSelector)[1] };
    } else if (isNestedSelector(classNameOrCSSRule)) {
      if (!parentSelector) throw new Error('Unable to generate nested rule because parentSelector is missing');
      // format of { '& > span': { display: 'none' } } (or further nesting)
      const replaced = classNameOrCSSRule.replace(/&/g, parentSelector);
      const toMerge = replaced.split(/,\s*/).map(selector => execCreateStyles(classNameRules as T, options, selector)[1]);
      toMerge.forEach((rs) => {
        const rulesKeys = Object.keys(rs);
        rulesKeys.forEach((ruleKey) => {
          if (toRender[ruleKey]) (toRender as any)[ruleKey] = [toRender[ruleKey], rs[ruleKey]];
          else (toRender as any)[ruleKey] = rs[ruleKey];
        });
      });
      // replaced.split(/,\s*/).forEach((selector) => {
      //   toRender = { ...toRender, ...execCreateStyles(classNameRules as T, options, selector)[1] };
      // });
    } else if (!parentSelector && typeof classNameRules === 'object') {
      const generated = generateClassName(classNameOrCSSRule);
      (out as any)[classNameOrCSSRule] = generated;
      toRender = { ...toRender, ...execCreateStyles(classNameRules as T, options, `.${generated}`)[1] };
    } else {
      if (!parentSelector) throw new Error('Unable to write css props because parent selector is null');
      if (!(toRender as any)[parentSelector]) (toRender as any)[parentSelector] = {};
      (toRender as any)[parentSelector][classNameOrCSSRule] = classNameRules;
    }
  }
  return [out, toRender];
}

function mapRenderableToSheet<T extends { [selector: string]: Properties | Properties[] }>(toRender: T): string {
  const entries = Object.entries(toRender);
  const mediaEntries = entries.filter(([selector]) => isMedia(selector));
  const nonMediaEntries = entries.filter(([selector]) => !isMedia(selector));
  return nonMediaEntries.concat(mediaEntries).reduce((prev, [selector, props]) => {
    if (isMedia(selector)) {
      if (Array.isArray(props)) return props.reduce((multiPrev, multiProps) => `${multiPrev}${selector}{${mapRenderableToSheet(multiProps as T)}}`, prev);
      return `${prev}${selector}{${mapRenderableToSheet(props as T)}}`;
    }
    if (Array.isArray(props)) return props.reduce((multiPrev, multiProps) => `${multiPrev}${selector}${formatCSSRules(multiProps)}`, prev);
    return `${prev}${selector}{${formatCSSRules(props)}}`;
  }, '');
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
  const [out, toRender] = execCreateStyles(rules, coerced, null);

  let sheetContents = mapRenderableToSheet(toRender);
  Object.entries(out).forEach(([classKey, selector]) => {
    sheetContents = sheetContents.replace(new RegExp(`\\$${classKey}`, 'g'), `.${selector}`);
  });
  if (coerced.flush) {
    const styleTag = document.createElement('style');
    styleTag.innerHTML = sheetContents;
    document.head.appendChild(styleTag);
  }
  return [
    out as unknown as O,
    sheetContents,
  ];
}

export type CreateStylesArgs = Parameters<typeof createStyles>;
