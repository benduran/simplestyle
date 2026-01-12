import { ClientBoundary, type ClientBoundaryProps } from './ClientBoundary.js';

/**
 * Accumulates all CSS rules and writes
 * them to your layout.
 * Use this for Next.js or other Next.js-like frameworks
 * that leverage React server components
 */
export function SimpleStyleProvider({
  children,
  ...rest
}: ClientBoundaryProps) {
  return <ClientBoundary {...rest}>{children}</ClientBoundary>;
}
