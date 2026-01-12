'use client';

// this client boundary is required to allow
// Next.js to collect the styles on the server
// but allow flushing them to the DOM at runtime

import type { SimpleStyleRegistry } from '../simpleStyleRegistry.js';

export function ClientBoundary({
  rules,
}: {
  rules: ReturnType<SimpleStyleRegistry['getRulesById']>;
}) {
  return (
    <>
      {rules.map(([ruleId, css]) => (
        <style id={ruleId} key={ruleId}>
          {css}
        </style>
      ))}
    </>
  );
}
