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

type ParentSelector = string | null;

function execCreateStyles<
  T extends SimpleStyleRules,
  K extends keyof T,
  O extends { [classname in K]: string },
>(
  rules: T,
  options: CreateStylesOptions,
  parentSelector: ParentSelector,
): O {
  const out = {} as O;
  const styleEntries = Object.entries(rules);
  for (const [classNameOrCSSRule, classNameRules] of styleEntries) {
    let generated = '';
    if (isNestedSelector(classNameOrCSSRule)) {
      if (!parentSelector) throw new Error('Unable to generate nested selector because parentSelector is null');
      generated = classNameOrCSSRule.replace(/&/g, parentSelector);
    } else generated = generateClassName(classNameOrCSSRule);
    if (typeof classNameRules === 'object') execCreateStyles(classNameRules as SimpleStyleRules, options, generated);
  }
  return out;
}

export default function createStyles<
  T extends SimpleStyleRules,
  K extends keyof T,
  O extends { [classname in K]: string },
>(
  rules: T,
  options?: Partial<CreateStylesOptions>,
): O {
  const coerced: CreateStylesOptions = {
    accumulate: options?.accumulate || false,
    flush: options?.flush || true,
  };
  return execCreateStyles<T, K, O>(rules, coerced, null);
}

export type CreateStylesArgs = Parameters<typeof createStyles>;
