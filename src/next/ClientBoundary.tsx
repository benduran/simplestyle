'use client';

// this client boundary is required to allow
// Next.js to collect the styles on the server
// but allow flushing them to the DOM at runtime

import { type PropsWithChildren, use } from 'react';
import { IHateNextJSContext } from './IHateNextJsContext.js';

export function ClientBoundary({ children }: PropsWithChildren) {
  const ctx = use(IHateNextJSContext);

  if (!ctx) return null;

  return (
    <>
      {ctx.registry.getRulesById().map(([ruleId, css]) => (
        <style id={ruleId} key={ruleId}>
          {css}
        </style>
      ))}
      {children}
    </>
  );
}
