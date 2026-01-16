'use client';

// @ts-expect-error - this is a tsc error in this project because it's not a full next.js app
import { useServerInsertedHTML } from 'next/navigation';
import type { PropsWithChildren } from 'react';
import type { SimpleStyleRegistry } from '../simpleStyleRegistry.js';
import { getPendingRules, getSimpleStyleRegistry } from './registry.js';
/**
 * Accumulates all CSS rules and writes
 * them to your layout.
 * Use this for Next.js or other Next.js-like frameworks
 * that leverage React server components
 */
export function SimpleStyleProvider({
  children,
  registry,
}: PropsWithChildren & { registry?: SimpleStyleRegistry | null }) {
  const activeRegistry = registry ?? getSimpleStyleRegistry();

  useServerInsertedHTML(() => {
    const rules = getPendingRules(activeRegistry);
    if (!rules.length) return null;

    return (
      <>
        {rules.map(([ruleId, css]) => (
          <style
            data-simplestyle-created-at-runtime={false}
            id={ruleId}
            key={ruleId}
          >
            {css}
          </style>
        ))}
      </>
    );
  });

  return <>{children}</>;
}
