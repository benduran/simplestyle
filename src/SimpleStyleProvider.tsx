import type { PropsWithChildren } from 'react';
import type { SimpleStyleRegistry } from './simpleStyleRegistry.js';

export function makeSimpleStyleProvider(registry: SimpleStyleRegistry) {
  /**
   * Accumulates all CSS rules and writes
   * them to your layout.
   * Use this for Next.js or other Next.js-like frameworks
   * that leverage React server components
   */
  return function SimpleStyleProvider({ children }: PropsWithChildren) {
    return (
      <>
        {registry.getRulesById().map(([ruleId, css]) => (
          <style id={ruleId} key={ruleId}>
            {css}
          </style>
        ))}
        {children}
      </>
    );
  };
}
