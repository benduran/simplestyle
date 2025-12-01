import { Properties } from 'csstype';
import merge from 'deepmerge';

import { generateClassName } from './generateClassName.js';
import { getPosthooks } from './plugins.js';
import { SimpleStyleRules } from './types.js';

export type CreateStylesOptions = Partial<{
  /**
   * If true, automatically renders generated styles
   * to the DOM in an injected <style /> tag
   */
  flush: boolean;

  /**
   * If set, along with flush: true,
   * will render the injected <style /> after this element
   */
  insertAfter?: HTMLElement;
  /**
   * If set, along with flush: true,
   * will render the injects <style /> before this element
   */
  insertBefore?: HTMLElement;
}>;

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
  return Object.entries(cssRules).reduce(
    (prev, [cssProp, cssVal]) => `${prev}${formatCSSRuleName(cssProp)}:${cssVal};`,
    '',
  );
}

function execCreateStyles<T extends SimpleStyleRules, K extends keyof T, O extends { [classKey in K]: string }>(
  rules: T,
  options: CreateStylesOptions,
  parentSelector: string | null,
  noGenerateClassName: boolean = false,
): { classes: O; sheetBuffer: string; mediaQueriesBuffer: string } {
  const out = {} as O;
  let sheetBuffer = '';
  let mediaQueriesBuffer = '';
  const styleEntries = Object.entries(rules);
  let ruleWriteOpen = false;
  const guardCloseRuleWrite = () => {
    if (ruleWriteOpen) sheetBuffer += '}';
    ruleWriteOpen = false;
  };
  for (const [classNameOrCSSRule, classNameRules] of styleEntries) {
    // if the classNameRules is a string, we are dealing with a display: none; type rule
    if (isMedia(classNameOrCSSRule)) {
      if (typeof classNameRules !== 'object')
        throw new Error('Unable to map @media query because rules / props are an invalid type');
      guardCloseRuleWrite();
      mediaQueriesBuffer += `${classNameOrCSSRule}{`;
      const { mediaQueriesBuffer: mediaQueriesOutput, sheetBuffer: regularOutput } = execCreateStyles(
        classNameRules as T,
        options,
        parentSelector,
      );
      mediaQueriesBuffer += regularOutput;
      mediaQueriesBuffer += '}';
      mediaQueriesBuffer += mediaQueriesOutput;
    } else if (isNestedSelector(classNameOrCSSRule)) {
      if (!parentSelector) throw new Error('Unable to generate nested rule because parentSelector is missing');
      guardCloseRuleWrite();
      // format of { '& > span': { display: 'none' } } (or further nesting)
      const replaced = classNameOrCSSRule.replace(/&/g, parentSelector);
      for (const selector of replaced.split(/,\s*/)) {
        const { mediaQueriesBuffer: mediaQueriesOutput, sheetBuffer: regularOutput } = execCreateStyles(
          classNameRules as T,
          options,
          selector,
        );
        sheetBuffer += regularOutput;
        mediaQueriesBuffer += mediaQueriesOutput;
      }
    } else if (!parentSelector && typeof classNameRules === 'object') {
      guardCloseRuleWrite();
      const generated = noGenerateClassName ? classNameOrCSSRule : generateClassName(classNameOrCSSRule);
      (out as any)[classNameOrCSSRule] = generated;
      const generatedSelector = `${noGenerateClassName ? '' : '.'}${generated}`;
      const { mediaQueriesBuffer: mediaQueriesOutput, sheetBuffer: regularOutput } = execCreateStyles(
        classNameRules as T,
        options,
        generatedSelector,
      );
      sheetBuffer += regularOutput;
      mediaQueriesBuffer += mediaQueriesOutput;
    } else {
      if (!parentSelector) throw new Error('Unable to write css props because parent selector is null');
      if (!ruleWriteOpen) {
        sheetBuffer += `${parentSelector}{${formatCSSRules({ [classNameOrCSSRule]: classNameRules })}`;
        ruleWriteOpen = true;
      } else sheetBuffer += formatCSSRules({ [classNameOrCSSRule]: classNameRules });
    }
  }
  guardCloseRuleWrite();
  return {
    classes: out,
    sheetBuffer,
    mediaQueriesBuffer,
  };
}

function replaceBackReferences<O extends { [key: string]: string }>(out: O, sheetContents: string): string {
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

function createSheet(sheetContents: string) {
  if (typeof document === 'undefined') return null;
  if (typeof document?.head?.appendChild !== 'function' || typeof document?.createElement !== 'function') return null;
  const styleTag = document.createElement('style');
  styleTag.innerHTML = sheetContents;
  return styleTag;
}

function flushSheetContents(sheetContents: string, options?: CreateStylesOptions) {
  // In case we're in come weird test environment that doesn't support JSDom
  const styleTag = createSheet(sheetContents);
  if (styleTag) {
    if (options?.insertAfter && options?.insertBefore) {
      throw new Error('Both insertAfter and insertBefore were provided. Please choose only one.');
    }
    if (options?.insertAfter?.after) options.insertAfter.after(styleTag as Node);
    else if (options?.insertBefore?.before) options.insertBefore.before(styleTag as Node);
    else document.head.appendChild(styleTag);
  }
  return styleTag;
}

function coerceCreateStylesOptions(options?: CreateStylesOptions): CreateStylesOptions {
  return {
    flush: options && typeof options.flush === 'boolean' ? options.flush : true,
  };
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function rawStyles<T extends SimpleStyleRules, K extends keyof T, O extends { [key in K]: string }>(
  rules: T,
  options?: Partial<CreateStylesOptions>,
) {
  const coerced = coerceCreateStylesOptions(options);
  const { sheetBuffer: sheetContents, mediaQueriesBuffer: mediaQueriesContents } = execCreateStyles(
    rules,
    coerced,
    null,
    true,
  );

  const mergedContents = `${sheetContents}${mediaQueriesContents}`;

  if (coerced.flush) flushSheetContents(mergedContents, options);
  return mergedContents;
}

export function keyframes<T extends { [increment: string]: Properties }>(
  frames: T,
  options?: CreateStylesOptions,
): [string, string] {
  const coerced = coerceCreateStylesOptions(options);
  const keyframeName = generateClassName('keyframes_');
  const { sheetBuffer: keyframesContents } = execCreateStyles(frames, coerced, null, true);
  const sheetContents = `@keyframes ${keyframeName}{${keyframesContents}}`;
  if (coerced.flush) flushSheetContents(sheetContents);
  return [keyframeName, sheetContents];
}

export default function createStyles<
  T extends SimpleStyleRules,
  K extends keyof T,
  O extends { [classKey in K]: string },
>(rules: T, options?: Partial<CreateStylesOptions>) {
  const coerced = coerceCreateStylesOptions(options);
  const {
    classes: out,
    sheetBuffer: sheetContents,
    mediaQueriesBuffer: mediaQueriesContents,
  } = execCreateStyles(rules, coerced, null);

  const mergedContents = `${sheetContents}${mediaQueriesContents}`;

  const replacedSheetContents = replaceBackReferences(out, mergedContents);

  let sheet: ReturnType<typeof flushSheetContents> = null;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const updateSheet = <T2 extends SimpleStyleRules, K2 extends keyof T2, O2 extends { [classKey in K2]: string }>(
    updatedRules: Partial<T2>,
  ) => {
    if (((options?.flush && sheet) || !options?.flush) && updatedRules) {
      // We prefer the first set, and then we shallow merge
      const {
        classes: updatedOut,
        sheetBuffer: updatedSheetContents,
        mediaQueriesBuffer: updatedMediaQueriesContents,
      } = execCreateStyles(merge(rules, updatedRules), { flush: false }, null);

      const updatedMergedContents = `${updatedSheetContents}${updatedMediaQueriesContents}`;

      const updatedReplacedSheetContents = replaceBackReferences(out, updatedMergedContents);
      if (sheet) sheet.innerHTML = updatedReplacedSheetContents;
      return { classes: updatedOut, stylesheet: updatedSheetContents } as {
        classes: typeof updatedOut;
        stylesheet: string;
      };
    }
    return null;
  };

  if (coerced.flush) sheet = flushSheetContents(replacedSheetContents, options);
  // Need this TS cast to get solid code assist from the consumption-side
  return {
    classes: out as unknown,
    stylesheet: replacedSheetContents,
    updateSheet,
  } as {
    classes: O;
    stylesheet: string;
    updateSheet: typeof updateSheet;
  };
}

export type CreateStylesArgs = Parameters<typeof createStyles>;
