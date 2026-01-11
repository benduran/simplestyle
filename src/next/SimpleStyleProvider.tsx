'use client';

import type { PropsWithChildren } from 'react';
import type { SimpleStyleRegistry } from '../simpleStyleRegistry.js';

export type SimpleStyleProviderProps = PropsWithChildren & {
  registry: SimpleStyleRegistry;
};

/**
 * Accumulates all CSS rules and writes
 * them to your layout.
 * Use this for Next.js or other Next.js-like frameworks
 * that leverage React server components
 */
export function SimpleStyleProvider({
  children,
  registry,
}: SimpleStyleProviderProps) {
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
}
