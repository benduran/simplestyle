
import { Properties as CSSProperties } from 'csstype';

import createClassName from './createClassName';
import SimpleStylesheet from './simpleStylesheet';
import { ISimpleStyleRules } from './styleTypes';

const camelCaseRegex = /([a-z])([A-Z])/g;

const sheets: SimpleStylesheet[] = [];

function formatRules(rules: CSSProperties): string {
  return Object.entries(rules).reduce((prev: string, [rule, val]: [string, string]) => {
    const formattedRule = rule.replace(camelCaseRegex, (match, p1, p2) => `${p1}-${p2.toLowerCase()}`);
    return `${prev}${formattedRule}: ${val};`;
  }, '');
}

export function getAllSheets() { return sheets; }

export default function createStyles<
  T extends { [classKey: string]: ISimpleStyleRules<T> },
  K extends keyof T,
  O extends { [classKey in K]: string }
>(styles: T, seed: number = new Date().getTime()): O {
  let tseed = seed;
  const sheet = new SimpleStylesheet();
  sheets.push(sheet);
  const out: O = Object.keys(styles).reduce((prev: O, classKey: string) => {
    const classname = createClassName(tseed++, classKey);
    const selector = `.${classname}`;
    sheet.addRule(selector, formatRules(styles[classKey] as CSSProperties));
    // TODO: Recursively traverse the styles object and create the stylesheet
    return Object.assign(prev, {
      [classKey]: classname,
    });
  }, {} as O);
  return out;
}
