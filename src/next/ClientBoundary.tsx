import { useServerInsertedHTML } from 'next/navigation';
import type { PropsWithChildren } from 'react';
import type { SimpleStyleRegistry } from '../simpleStyleRegistry.js';

export function ClientBoundary({
  children,
  registry,
}: PropsWithChildren & {
  registry: SimpleStyleRegistry;
}) {
  useServerInsertedHTML(() => {
    const rules = registry.getRulesById();
    if (!rules.length) return null;

    return (
      <>
        {rules.map(([ruleId, css]) => {
          if (!css) return null;
          return (
            <style id={ruleId} key={ruleId}>
              {css}
            </style>
          );
        })}
      </>
    );
  });

  return <>{children}</>;
}
