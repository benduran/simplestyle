import createClassName from './createClassName';
import SimpleStylesheet from './simpleStylesheet';
import { ISimpleStyleRules } from './styleTypes';

const camelCaseRegex = /([a-z])([A-Z])/g;

const sheets: SimpleStylesheet[] = [];

// TODO: The order of operations here doesn't "feel" right, but it is working for now.

function formatRules<T>(
  sheet: SimpleStylesheet,
  flush: boolean,
  rules: ISimpleStyleRules<T>,
  parentSelector?: string,
): string {
  if (parentSelector && rules.$nested) createStylesImpl(rules.$nested, flush, new Date().getTime(), sheet, parentSelector);
  return Object.keys(rules).reduce((prev: string, selectorOrRule: string) => {
    if (selectorOrRule === '$nested') return prev;
    const formattedRule = selectorOrRule.replace(camelCaseRegex, (match, p1, p2) => `${p1}-${p2.toLowerCase()}`);
    return `${prev}${formattedRule}:${rules[selectorOrRule]};`;
  }, '');
}

function createStylesImpl<
  T extends { [classKey: string]: ISimpleStyleRules<T> },
  K extends keyof T,
  O extends { [classKey in K]: string }
>(
  styles: T,
  flush: boolean,
  seed: number = new Date().getTime(),
  sheetOverride: SimpleStylesheet | null = null,
  parentSelector: string | null = null,
): O {
  let tseed = seed;
  const sheet = sheetOverride || new SimpleStylesheet();
  sheets.push(sheet);
  const out: O = Object.keys(styles).reduce(
    (prev: O, classKey: string) => {
      const classname = parentSelector ? classKey.replace(/&/g, parentSelector) : createClassName(tseed++, classKey);
      const selector = parentSelector ? classname : `.${classname}`;
      sheet.addRule(classKey, selector, formatRules(sheet, flush, styles[classKey]), parentSelector === null);
      formatRules(sheet, flush, styles[classKey], selector);
      return Object.assign(prev, {
        [classKey]: classname,
      });
    },
    {} as O,
  );
  sheet.updateNestedSelectors();
  if (flush) sheet.attach();
  return out;
}

export function getAllSheets() {
  return sheets;
}

export default function createStyles<
  T extends { [classKey: string]: ISimpleStyleRules<T> },
  K extends keyof T,
  O extends { [classKey in K]: string }
>(
  styles: T,
  flush: boolean = true,
  seed: number = new Date().getTime(),
): O {
  return createStylesImpl<T, K, O>(styles, flush, seed);
}
