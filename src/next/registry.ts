import { SimpleStyleRegistry } from '../simpleStyleRegistry.js';

/**
 * returns a per-request CSS registry that works with Nextjs
 * in both SSR and client components
 */
export function getSimpleStyleRegistryForNext() {
  if (
    globalThis.window === undefined ||
    globalThis.window.document === undefined
  ) {
    return new SimpleStyleRegistry();
  }

  return null;
}
