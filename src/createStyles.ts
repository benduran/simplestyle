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
  noGenerateClassName: boolean = false,
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
    } else if (!parentSelector && typeof classNameRules === 'object') {
      const generated = noGenerateClassName ? classNameOrCSSRule : generateClassName(classNameOrCSSRule);
      (out as any)[classNameOrCSSRule] = generated;
      toRender = { ...toRender, ...execCreateStyles(classNameRules as T, options, `${noGenerateClassName ? '' : '.'}${generated}`)[1] };
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

function generateSheetContents<O extends any, T extends { [selector: string]: Properties | Properties[] }>(out: O, toRender: T): string {
  let sheetContents = mapRenderableToSheet(toRender);
  Object.entries(out).forEach(([classKey, selector]) => {
    sheetContents = sheetContents.replace(new RegExp(`\\$${classKey}`, 'g'), `.${selector}`);
  });
  return sheetContents;
}

function flushSheetContents(sheetContents: string) {
  // In case we're in come weird test environment that doesn't support JSDom
  if (typeof document !== 'undefined' && document.head && document.head.appendChild) {
    const styleTag = document.createElement('style');
    styleTag.innerHTML = sheetContents;
    document.head.appendChild(styleTag);
  }
}

function coerceCreateStylesOptions(options?: Partial<CreateStylesOptions>): CreateStylesOptions {
  return {
    accumulate: options?.accumulate || false,
    flush: options && typeof options.flush === 'boolean' ? options.flush : true,
  };
}

export function rawStyles<T extends SimpleStyleRules, K extends keyof T, O extends { [key in K]: string }>(
  rules: T,
  options?: Partial<CreateStylesOptions>,
) {
  const coerced = coerceCreateStylesOptions(options);
  const [out, toRender] = execCreateStyles(rules, coerced, null, true);
  const sheetContents = generateSheetContents(out, toRender);

  if (coerced.flush) flushSheetContents(sheetContents);
  return sheetContents;
}

export default function createStyles<
  T extends SimpleStyleRules,
  K extends keyof T,
  O extends { [classKey in K]: string },
>(
  rules: T,
  options?: Partial<CreateStylesOptions>,
): [O, string] {
  const coerced = coerceCreateStylesOptions(options);
  const [out, toRender] = execCreateStyles(rules, coerced, null);

  const sheetContents = generateSheetContents(out, toRender);

  if (coerced.flush) flushSheetContents(sheetContents);
  return [
    out as unknown as O,
    sheetContents,
  ];
}

export type CreateStylesArgs = Parameters<typeof createStyles>;
