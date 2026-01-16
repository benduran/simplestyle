const styleCache = new Map<string, string>();

export function setCachedRule(ruleId: string, css: string) {
  styleCache.set(ruleId, css);
}

export function getCachedRules() {
  return [...styleCache.entries()];
}
