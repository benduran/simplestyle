
const camelCaseRegex = /([a-z])([A-Z])/g;

export default function formatCssRule(rule: string) {
  return rule.replace(camelCaseRegex, (match, p1, p2) => `${p1}-${p2.toLowerCase()}`);
}
