'use client';

import { type PropsWithChildren, useEffect, useState } from 'react';
// this client boundary is required to allow
// Next.js to collect the styles on the server
// but allow flushing them to the DOM at runtime

import type { SimpleStyleRegistry } from '../simpleStyleRegistry.js';
import type { Nullish } from '../types.js';

export function ClientBoundary({
  children,
  registry,
}: PropsWithChildren & {
  registry: SimpleStyleRegistry;
}) {
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
      {rules.map(([ruleId, css]) => (
        <style id={ruleId} key={ruleId}>
          {css}
        </style>
      ))}
      {children}
    </>
  );
}
