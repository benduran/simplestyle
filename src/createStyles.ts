import { Properties } from 'csstype';

import { SimpleStyleRules } from './types';
import generateClassName from './generateClassName';
import { getPosthooks } from './plugins';

export interface CreateStylesOptions {
  accumulate: boolean;
  flush: boolean;
}

let accumulatedSheetContents: string[] | null = null;

function isNestedSelector(r: string): boolean {
  return /&/g.test(r);
}

function isMedia(r: string): boolean {
  return r.toLowerCase().startsWith('@media');
}

function formatCSSRuleName(rule: string): string {
  return rule.replace(/([A-Z])/g, (p1) => `-${p1.toLowerCase()}`);
}

function formatCSSRules(cssRules: Properties): string {
  return Object.entries(cssRules).reduce((prev, [cssProp, cssVal]) => `${prev}${formatCSSRuleName(cssProp)}:${cssVal};`, '');
}

function execCreateStyles<T extends SimpleStyleRules, K extends keyof T, O extends { [classKey in K]: string }>(
  rules: T,
  options: CreateStylesOptions,
  parentSelector: string | null,
  noGenerateClassName: boolean | null = false,
  uid: string | null = null,
): [O, string, string] {
  const out = {} as O;
  let sheetBuffer = '';
  let mediaQueriesbuffer = '';
  const styleEntries = Object.entries(rules);
  let ruleWriteOpen = false;
  const guardCloseRuleWrite = () => {
    if (ruleWriteOpen) sheetBuffer += '}';
    ruleWriteOpen = false;
  };
  for (const [classNameOrCSSRule, classNameRules] of styleEntries) {
    // if the classNameRules is a string, we are dealing with a display: none; type rule
    if (isMedia(classNameOrCSSRule)) {
      if (typeof classNameRules !== 'object') throw new Error('Unable to map @media query because rules / props are an invalid type');
      guardCloseRuleWrite();
      mediaQueriesbuffer += `${classNameOrCSSRule}{`;
      const [, regularOutput, mediaQueriesOutput] = execCreateStyles(classNameRules as T, options, parentSelector, null, uid);
      mediaQueriesbuffer += regularOutput;
      mediaQueriesbuffer += '}';
      mediaQueriesbuffer += mediaQueriesOutput;
    } else if (isNestedSelector(classNameOrCSSRule)) {
      if (!parentSelector) throw new Error('Unable to generate nested rule because parentSelector is missing');
      guardCloseRuleWrite();
      // format of { '& > span': { display: 'none' } } (or further nesting)
      const replaced = classNameOrCSSRule.replace(/&/g, parentSelector);
      replaced.split(/,\s*/).forEach((selector) => {
        const [, regularOutput, mediaQueriesOutput] = execCreateStyles(classNameRules as T, options, selector, null, uid);
        sheetBuffer += regularOutput;
        mediaQueriesbuffer += mediaQueriesOutput;
      });
    } else if (!parentSelector && typeof classNameRules === 'object') {
      guardCloseRuleWrite();
      let generated = generateClassName([classNameOrCSSRule, uid]);
      if (noGenerateClassName) {
        generated = classNameOrCSSRule;
      }
      (out as any)[classNameOrCSSRule] = generated;
      const generatedSelector = `${noGenerateClassName ? '' : '.'}${generated}`;
      const [, regularOutput, mediaQueriesOutput] = execCreateStyles(classNameRules as T, options, generatedSelector, null, uid);
      sheetBuffer += regularOutput;
      mediaQueriesbuffer += mediaQueriesOutput;
    } else {
      if (!parentSelector) throw new Error('Unable to write css props because parent selector is null');
      if (!ruleWriteOpen) {
        sheetBuffer += `${parentSelector}{${formatCSSRules({ [classNameOrCSSRule]: classNameRules })}`;
        ruleWriteOpen = true;
      } else sheetBuffer += formatCSSRules({ [classNameOrCSSRule]: classNameRules });
    }
  }
  guardCloseRuleWrite();
  return [out, sheetBuffer, mediaQueriesbuffer];
}

function replaceBackReferences<O extends any>(out: O, sheetContents: string): string {
  let outputSheetContents = sheetContents;
  const toReplace: string[] = [];
  const toReplaceRegex = /\$\w([a-zA-Z0-9_-]+)?/gm;
  let matches = toReplaceRegex.exec(outputSheetContents);
  while (matches) {
    toReplace.push(matches[0].valueOf());
    matches = toReplaceRegex.exec(outputSheetContents);
  }
  for (const r of toReplace) {
    outputSheetContents = outputSheetContents.replace(r, `.${out[r.substring(1)]}`);
  }
  return getPosthooks().reduce((prev, hook) => hook(prev), outputSheetContents);
}

function flushSheetContents(sheetContents: string) {
  // In case we're in come weird test environment that doesn't support JSDom
  if (typeof document !== 'undefined' && document.head && document.head.appendChild) {
    const styleTag = document.createElement('style');
    styleTag.innerHTML = sheetContents;
    document.head.appendChild(styleTag);
  }
}

function coerceCreateStylesOptions(options?: Partial<CreateStylesOptions> | null): CreateStylesOptions {
  return {
    accumulate: options?.accumulate || false,
    flush: options && typeof options.flush === 'boolean' ? options.flush : true,
  };
}

let accumulatedTimeout: any;
function accumulateSheetContents(sheetContents: string, options: CreateStylesOptions): void {
  if (!accumulatedSheetContents) accumulatedSheetContents = [];
  accumulatedSheetContents.push(sheetContents);
  if (accumulatedTimeout) accumulatedTimeout = clearTimeout(accumulatedTimeout);
  accumulatedTimeout = setTimeout(() => {
    flushSheetContents(accumulatedSheetContents!.reduce((prev, contents) => `${prev}${contents}`, ''));
    accumulatedSheetContents = null;
  }, 0);
}

export function rawStyles<T extends SimpleStyleRules, K extends keyof T, O extends { [key in K]: string }>(
  rules: T,
  options: Partial<CreateStylesOptions> | null = null,
  uid: string | null = null,
) {
  const coerced = coerceCreateStylesOptions(options);
  const [, sheetContents, mediaQueriesContents] = execCreateStyles(rules, coerced, null, true, uid);

  const mergedContents = `${sheetContents}${mediaQueriesContents}`;

  if (coerced.accumulate) accumulateSheetContents(mergedContents, coerced);
  else if (coerced.flush) flushSheetContents(mergedContents);
  return mergedContents;
}

export function keyframes<T extends { [increment: string]: Properties }>(frames: T, options: CreateStylesOptions | null = null, uid: string | null = null): [string, string] {
  const coerced = coerceCreateStylesOptions(options);
  const keyframeName = generateClassName(['keyframes_']);
  const [out, keyframesContents] = execCreateStyles(frames, coerced, null, true, uid);
  // const keyframesContents = generateSheetContents(out, toRender);
  const sheetContents = `@keyframes ${keyframeName}{${keyframesContents}}`;
  if (coerced.accumulate) accumulateSheetContents(sheetContents, coerced);
  if (coerced.flush) flushSheetContents(sheetContents);
  return [keyframeName, sheetContents];
}

export default function createStyles<T extends SimpleStyleRules, K extends keyof T, O extends { [classKey in K]: string }>(
  rules: T,
  options: Partial<CreateStylesOptions> | null = null,
  uid: string | null = null,
): [O, string] {
  const coerced = coerceCreateStylesOptions(options);
  const [out, sheetContents, mediaQueriesContents] = execCreateStyles(rules, coerced, null, null, uid);

  const mergedContents = `${sheetContents}${mediaQueriesContents}`;

  const replacedSheetContents = replaceBackReferences(out, mergedContents);

  if (coerced.accumulate) accumulateSheetContents(replacedSheetContents, coerced);
  else if (coerced.flush) flushSheetContents(replacedSheetContents);
  return [(out as unknown) as O, replacedSheetContents];
}

export type CreateStylesArgs = Parameters<typeof createStyles>;
