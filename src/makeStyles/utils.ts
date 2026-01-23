import type { Properties } from 'csstype';

export function isNestedSelector(r: string): boolean {
  return /&/g.test(r);
}

export function isMediaOrContainer(r: string): boolean {
  const query = r.toLowerCase();

  return query.startsWith('@media') || query.startsWith('@container');
}

export function formatCSSRuleName(rule: string): string {
  return rule.replaceAll(/([A-Z])/g, (p1) => `-${p1.toLowerCase()}`);
}

export function formatCSSRules(cssRules: Properties): string {
  return Object.entries(cssRules).reduce(
    (prev, [cssProp, cssVal]) =>
      `${prev}${formatCSSRuleName(cssProp)}:${String(cssVal)};`,
    '',
  );
}
