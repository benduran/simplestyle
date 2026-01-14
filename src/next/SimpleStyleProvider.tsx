import type { PropsWithChildren } from 'react';
import type { SimpleStyleRegistry } from '../simpleStyleRegistry.js';
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
  return <ClientBoundary registry={registry}>{children}</ClientBoundary>;
}
