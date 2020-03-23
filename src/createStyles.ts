import { SimpleStyleRules } from './types';

export interface CreateStylesOptions {
  accumulate: boolean;
  flush: boolean;
}

function isNestedSelector(r: string): boolean {
  return r.startsWith('&');
}

type ParentSelector = string | null;

function execCreateStyles<
  T extends SimpleStyleRules,
  K extends keyof T,
  O extends { [classname in K]: string },
>(rules: T, options: CreateStylesOptions, parentSelector: ParentSelector): O {
  const out = {} as O;
  const styleEntries = Object.entries(rules);
  for (const [className, rules] of styleEntries) {

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
