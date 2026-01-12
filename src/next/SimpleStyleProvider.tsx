import type { PropsWithChildren } from 'react';
import type { SimpleStyleRegistry } from '../simpleStyleRegistry.js';
import { ClientBoundary } from './ClientBoundary.js';

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
    <ClientBoundary>
      {registry.getRulesById().map(([ruleId, css]) => (
        <style id={ruleId} key={ruleId}>
          {css}
        </style>
      ))}
      {children}
    </ClientBoundary>
  );
}
