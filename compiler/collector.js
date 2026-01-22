/**
 * @typedef {import('../dist/ssr/makeCssFuncsSSR.mjs')['makeCssFuncs']} makeCssFuncs
 */

/**
 * @typedef {keyof ReturnType<makeCssFuncs>} FncName
 */

/** @type {Map<'ssjs-imports' | 'ssjs-globals' | 'ssjs-styles', string[]>} */
const COLLECTOR = new Map();

/** @type {Map<FncName, Set<string>>} */
const SEEN_IDS = new Map();

export function resetCollector() {
  COLLECTOR.clear();
  COLLECTOR.set('ssjs-imports', []);
  COLLECTOR.set('ssjs-globals', []);
  COLLECTOR.set('ssjs-styles', []);
}

export function resetSeenIds() {
  SEEN_IDS.clear();
}

/**
 * adds a seen id to the map and throws a warning
 * if it was already seen
 * @param {FncName} type
 * @param {string} ruleId
 */
export function addSeenIdAndWarn(type, ruleId) {
  const existing = SEEN_IDS.get(type);
  if (existing?.has(ruleId)) {
    console.warn(
      '☢️ ruleId',
      ruleId,
      'is a duplicate. Ensure that all rule Ids you are using with',
      type,
      'are unique!',
    );
  }

  SEEN_IDS.set(type, new Set([...(existing ?? []), ruleId]));
}

resetCollector();
resetSeenIds();

export { COLLECTOR, SEEN_IDS };
