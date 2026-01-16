import { cache } from 'react';
import { SimpleStyleRegistry } from '../simpleStyleRegistry.js';
import { getCachedRules } from '../styleCache.js';

const getServerRegistry = cache(() => {
  const registry = new SimpleStyleRegistry();
  for (const [ruleId, css] of getCachedRules()) {
    registry.add(ruleId, css);
  }
  return registry;
});

export function getSimpleStyleRegistry() {
  if (typeof window !== 'undefined') return null;
  return getServerRegistry();
}

const getEmittedRuleIds = cache(() => new Set<string>());

export function getPendingRules(registry?: SimpleStyleRegistry | null) {
  const emitted = getEmittedRuleIds();
  const rules = new Map(getCachedRules());

  if (registry) {
    for (const [ruleId, css] of registry.getRulesById()) {
      rules.set(ruleId, css);
    }
  }

  const pending: [string, string][] = [];
  for (const [ruleId, css] of rules) {
    if (emitted.has(ruleId)) continue;

    emitted.add(ruleId);
    pending.push([ruleId, css]);
  }

  return pending;
}
