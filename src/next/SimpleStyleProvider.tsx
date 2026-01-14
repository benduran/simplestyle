import { type PropsWithChildren, useEffect, useState } from 'react';
import type { SimpleStyleRegistry } from '../simpleStyleRegistry.js';
import type { Nullish } from '../types.js';
import { ClientBoundary } from './ClientBoundary.js';
/**
 * Accumulates all CSS rules and writes
 * them to your layout.
 * Use this for Next.js or other Next.js-like frameworks
 * that leverage React server components
 */
export function SimpleStyleProvider({
  children,
  registry,
}: PropsWithChildren & { registry: SimpleStyleRegistry }) {
  /** state */
  const [rules, setRules] =
    useState<Nullish<ReturnType<typeof registry.getRulesById>>>(null);

  /** effects */
  useEffect(() => {
    const handleSettled = () => {
      setRules(registry.getRulesById());
    };
    registry.on('settled', handleSettled);

    return () => {
      registry.off('settled', handleSettled);
    };
  }, [registry]);

  if (!rules) return null;

  return (
    <>
      <ClientBoundary rules={rules} />
      {children}
    </>
  );
}
