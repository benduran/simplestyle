'use client';

// this client boundary is required to allow
// Next.js to collect the styles on the server
// but allow flushing them to the DOM at runtime

import type { PropsWithChildren } from 'react';
import type { SimpleStyleRegistry } from '../simpleStyleRegistry.js';

export type ClientBoundaryProps = PropsWithChildren & {
  registry: SimpleStyleRegistry;
};

export function ClientBoundary({ children, registry }: ClientBoundaryProps) {
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
