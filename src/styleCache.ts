const GLOBAL_STYLE_CACHE_KEY = Symbol.for('simplestyle-js.styleCache');

const globalRef = globalThis as typeof globalThis & {
  [GLOBAL_STYLE_CACHE_KEY]?: Map<string, string>;
};

const styleCache =
  globalRef[GLOBAL_STYLE_CACHE_KEY] ?? new Map<string, string>();

globalRef[GLOBAL_STYLE_CACHE_KEY] = styleCache;

export function setCachedRule(ruleId: string, css: string) {
  styleCache.set(ruleId, css);
}

export function getCachedRules() {
  return [...styleCache.entries()];
}
