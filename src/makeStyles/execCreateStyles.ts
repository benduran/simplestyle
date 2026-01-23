import { generateClassName } from './generateClassName.js';
import type { CreateStylesOptions, SimpleStyleRules } from './types.js';
import {
  formatCSSRules,
  isMediaOrContainer,
  isNestedSelector,
} from './utils.js';

export function execCreateStyles<
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
    if (isMediaOrContainer(classNameOrCSSRule)) {
      if (typeof classNameRules !== 'object')
        throw new Error(
          'Unable to map @media or @container query because rules / props are an invalid type',
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
        : generateClassName(`${ruleId}_${classNameOrCSSRule}`, classNameRules);
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
