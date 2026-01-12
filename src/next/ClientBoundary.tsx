'use client';

// this client boundary is required to allow
// Next.js to collect the styles on the server
// but allow flushing them to the DOM at runtime

import type { PropsWithChildren } from 'react';

export function ClientBoundary({ children }: PropsWithChildren) {
  return <>{children}</>;
}
