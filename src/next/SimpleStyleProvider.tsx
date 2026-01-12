import type { PropsWithChildren } from 'react';
import { ClientBoundary } from './ClientBoundary.js';
import {
  IHateNextJSContext,
  type IHateNextJSProps,
} from './IHateNextJsContext.js';

/**
 * Accumulates all CSS rules and writes
 * them to your layout.
 * Use this for Next.js or other Next.js-like frameworks
 * that leverage React server components
 */
export function SimpleStyleProvider({
  children,
  ...rest
}: PropsWithChildren & IHateNextJSProps) {
  return (
    <IHateNextJSContext value={rest}>
      <ClientBoundary>{children}</ClientBoundary>
    </IHateNextJSContext>
  );
}
