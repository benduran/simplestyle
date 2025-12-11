/* eslint-disable @typescript-eslint/no-deprecated */
import type { Properties } from 'csstype';
import merge from 'deepmerge';

import { generateClassName } from './generateClassName.js';
import { getPosthooks } from './plugins.js';
import type { SimpleStyleRegistry } from './simpleStyleRegistry.js';
import type { SimpleStyleRules } from './types.js';

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

  /**
   * if set, will automatically prevent any styles from
   * being flushed to the DOM or inserted at all.
   * All styles will be accumulated in the registry
   * and it will be up to you to determine how they should
   * be flushed.
   */
  registry?: SimpleStyleRegistry;
}>;

function isNestedSelector(r: string): boolean {
  return /&/g.test(r);
}

function isMedia(r: string): boolean {
  return r.toLowerCase().startsWith('@media');
}

function formatCSSRuleName(rule: string): string {
  return rule.replaceAll(/([A-Z])/g, (p1) => `-${p1.toLowerCase()}`);
}

function formatCSSRules(cssRules: Properties): string {
  return Object.entries(cssRules).reduce(
    (prev, [cssProp, cssVal]) =>
      `${prev}${formatCSSRuleName(cssProp)}:${String(cssVal)};`,
    '',
  );
}

function execCreateStyles<
  T extends SimpleStyleRules,
  K extends keyof T,
  O extends Record<K, string>,
>(
  ruleId: string,
  rules: T,
  options: CreateStylesOptions,
  parentSelector: string | null,
  noGenerateClassName = false,
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
        throw new Error(
          'Unable to map @media query because rules / props are an invalid type',
        );
      guardCloseRuleWrite();
      mediaQueriesBuffer += `${classNameOrCSSRule}{`;
      const {
        mediaQueriesBuffer: mediaQueriesOutput,
        sheetBuffer: regularOutput,
      } = execCreateStyles(
        ruleId,
        classNameRules as T,
        options,
        parentSelector,
      );
      mediaQueriesBuffer += regularOutput;
      mediaQueriesBuffer += '}';
      mediaQueriesBuffer += mediaQueriesOutput;
    } else if (isNestedSelector(classNameOrCSSRule)) {
      if (!parentSelector)
        throw new Error(
          'Unable to generate nested rule because parentSelector is missing',
        );
      guardCloseRuleWrite();
      // format of { '& > span': { display: 'none' } } (or further nesting)
      const replaced = classNameOrCSSRule.replaceAll('&', parentSelector);
      for (const selector of replaced.split(/,\s*/)) {
        const {
          mediaQueriesBuffer: mediaQueriesOutput,
          sheetBuffer: regularOutput,
        } = execCreateStyles(ruleId, classNameRules as T, options, selector);
        sheetBuffer += regularOutput;
        mediaQueriesBuffer += mediaQueriesOutput;
      }
    } else if (!parentSelector && typeof classNameRules === 'object') {
      guardCloseRuleWrite();
      const generated = noGenerateClassName
        ? classNameOrCSSRule
        : generateClassName(`${ruleId}_${classNameOrCSSRule}`);
      // @ts-expect-error - yes, we can index this object here, so be quiet
      out[classNameOrCSSRule] = generated;
      const generatedSelector = `${noGenerateClassName ? '' : '.'}${generated}`;
      const {
        mediaQueriesBuffer: mediaQueriesOutput,
        sheetBuffer: regularOutput,
      } = execCreateStyles(
        ruleId,
        classNameRules as T,
        options,
        generatedSelector,
      );
      sheetBuffer += regularOutput;
      mediaQueriesBuffer += mediaQueriesOutput;
    } else {
      if (!parentSelector)
        throw new Error(
          'Unable to write css props because parent selector is null',
        );
      if (ruleWriteOpen) {
        sheetBuffer += formatCSSRules({ [classNameOrCSSRule]: classNameRules });
      } else {
        sheetBuffer += `${parentSelector}{${formatCSSRules({ [classNameOrCSSRule]: classNameRules })}`;
        ruleWriteOpen = true;
      }
    }
  }
  guardCloseRuleWrite();
  return {
    classes: out,
    sheetBuffer,
    mediaQueriesBuffer,
  };
}

function replaceBackReferences<O extends Record<string, string>>(
  out: O,
  sheetContents: string,
): string {
  let outputSheetContents = sheetContents;
  const toReplace: string[] = [];
  const toReplaceRegex = /\$\w([a-zA-Z0-9_-]+)?/gm;
  let matches = toReplaceRegex.exec(outputSheetContents);
  while (matches) {
    toReplace.push(matches[0].valueOf());
    matches = toReplaceRegex.exec(outputSheetContents);
  }
  for (const r of toReplace) {
    outputSheetContents = outputSheetContents.replace(
      r,
      `.${out[r.slice(1)] ?? ''}`,
    );
  }
  return getPosthooks().reduce((prev, hook) => hook(prev), outputSheetContents);
}

function createSheet(ruleId: string, sheetContents: string) {
  const out: { existing: boolean | null; styleTag: HTMLElement | null } = {
    existing: null,
    styleTag: null,
  };

  const doc = globalThis.document as
    | Partial<typeof globalThis.document>
    | null
    | undefined;
  if (doc === undefined) return out;
  if (
    typeof doc?.head?.appendChild !== 'function' ||
    typeof doc.createElement !== 'function'
  )
    return out;
  // attempt to reuse the style tag, if it existed
  const existingTag = doc.getElementById?.(ruleId);
  const existing = Boolean(existingTag);
  const styleTag = existingTag ?? doc.createElement('style');
  styleTag.id = ruleId;
  styleTag.innerHTML = sheetContents;
  out.existing = existing;
  out.styleTag = styleTag;

  return out;
}

function flushSheetContents(
  ruleId: string,
  sheetContents: string,
  options?: CreateStylesOptions,
) {
  // In case we're in come weird test environment that doesn't support JSDom
  const { existing, styleTag } = createSheet(ruleId, sheetContents);
  // if the tag existed, DO NOT render it back out to the DOM.
  if (existing) return styleTag;
  if (styleTag) {
    if (options?.insertAfter && options.insertBefore) {
      throw new Error(
        'Both insertAfter and insertBefore were provided. Please choose only one.',
      );
    }
    if (options?.insertAfter?.after)
      options.insertAfter.after(styleTag as Node);
    else if (options?.insertBefore?.before)
      options.insertBefore.before(styleTag as Node);
    else document.head.append(styleTag);
  }
  return styleTag;
}

function coerceCreateStylesOptions(
  options?: CreateStylesOptions,
): CreateStylesOptions {
  return {
    flush: options && typeof options.flush === 'boolean' ? options.flush : true,
  };
}

export function rawStyles<T extends SimpleStyleRules>(
  ruleId: string,
  rules: T,
  options?: Partial<CreateStylesOptions>,
) {
  const rawStylesId = `${ruleId}_raw`;
  const coerced = coerceCreateStylesOptions(options);
  const {
    sheetBuffer: sheetContents,
    mediaQueriesBuffer: mediaQueriesContents,
  } = execCreateStyles(rawStylesId, rules, coerced, null, true);

  const mergedContents = `${sheetContents}${mediaQueriesContents}`;

  if (options?.registry) {
    options.registry.add(rawStylesId, mergedContents);
  } else if (coerced.flush) {
    flushSheetContents(rawStylesId, mergedContents, options);
  }
  return mergedContents;
}

export function keyframes<T extends Record<string, Properties>>(
  ruleId: string,
  frames: T,
  options?: CreateStylesOptions,
) {
  const coerced = coerceCreateStylesOptions(options);
  const keyframeId = generateClassName(`${ruleId}_keyframes`);
  const { sheetBuffer: keyframesContents } = execCreateStyles(
    keyframeId,
    frames,
    coerced,
    null,
    true,
  );
  const stylesheet = `@keyframes ${keyframeId}{${keyframesContents}}`;
  if (options?.registry) {
    options.registry.add(keyframeId, stylesheet);
  } else if (coerced.flush) {
    flushSheetContents(keyframeId, stylesheet);
  }
  return { keyframe: keyframeId, stylesheet };
}

export function createStyles<
  T extends SimpleStyleRules,
  K extends keyof T,
  O extends Record<K, string>,
>(ruleId: string, rules: T, options?: Partial<CreateStylesOptions>) {
  const coerced = coerceCreateStylesOptions(options);
  const {
    classes: out,
    sheetBuffer: sheetContents,
    mediaQueriesBuffer: mediaQueriesContents,
  } = execCreateStyles(ruleId, rules, coerced, null);

  const mergedContents = `${sheetContents}${mediaQueriesContents}`;

  const replacedSheetContents = replaceBackReferences(out, mergedContents);

  let sheet: ReturnType<typeof flushSheetContents> = null;

  const updateSheet = <T2 extends SimpleStyleRules>(
    updatedRules: Partial<T2>,
  ) => {
    if (options?.flush || options?.registry || !options?.flush) {
      // We prefer the first set, and then we shallow merge
      const {
        classes: updatedOut,
        sheetBuffer: updatedSheetContents,
        mediaQueriesBuffer: updatedMediaQueriesContents,
      } = execCreateStyles(
        ruleId,
        merge(rules, updatedRules),
        { flush: false },
        null,
      );

      const updatedMergedContents = `${updatedSheetContents}${updatedMediaQueriesContents}`;

      const updatedReplacedSheetContents = replaceBackReferences(
        out,
        updatedMergedContents,
      );
      if (sheet) sheet.innerHTML = updatedReplacedSheetContents;
      else if (options?.registry) {
        options.registry.add(ruleId, updatedReplacedSheetContents);
      }
      return { classes: updatedOut, stylesheet: updatedSheetContents } as {
        classes: typeof updatedOut;
        stylesheet: string;
      };
    }
    return null;
  };

  if (!options?.registry && coerced.flush) {
    sheet = flushSheetContents(ruleId, replacedSheetContents, options);
  } else if (options?.registry) {
    options.registry.add(ruleId, replacedSheetContents);
  }
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

export default createStyles;
