import SimpleStylesheet from './simpleStylesheet';
import { SimpleStyleRules } from './styleTypes';

const camelCaseRegex = /([a-z])([A-Z])/g;

export function formatCssRule(rule: string) {
  return rule.replace(camelCaseRegex, (match, p1, p2) => `${p1}-${p2.toLowerCase()}`);
}

export function formatRules<T>(
  sheet: SimpleStylesheet,
  flush: boolean,
  rules: SimpleStyleRules<T>,
  parentSelector?: string,
  createStylesCb?: (styles: SimpleStyleRules<T>, flush: boolean, sheet: SimpleStylesheet, parentSelector?: string) => any,
): string {
  const ruleKeys = Object.keys(rules);
  const nestedStyleKeys = ruleKeys.filter(rk => typeof rules[rk] === 'object');
  if (parentSelector && createStylesCb && nestedStyleKeys.length) {
    createStylesCb(
      nestedStyleKeys.reduce((prev: SimpleStyleRules<T>, rk: string) => Object.assign(prev, { [rk]: rules[rk] }), {}),
      flush,
      sheet,
      parentSelector,
    );
  }
  return ruleKeys.reduce((prev: string, selectorOrRule: string) => {
    if (selectorOrRule.startsWith('&') || typeof rules[selectorOrRule] === 'object') return prev;
    const formattedRule = formatCssRule(selectorOrRule);
    return `${prev}${formattedRule}:${rules[selectorOrRule]};`;
  }, '');
}
