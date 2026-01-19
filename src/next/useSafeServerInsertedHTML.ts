// @ts-expect-error - this package is not defined because we're not in an actual next.js project
import { useServerInsertedHTML as useInserted } from 'next/navigation';
import type { ReactNode } from 'react';
import type { Nullish } from '../types.js';

const useServerInsertedHTML: Nullish<useInserted> = useInserted;

export function useSafeServerInsertedHTML(cb: () => ReactNode) {
  useServerInsertedHTML?.(cb);
}
