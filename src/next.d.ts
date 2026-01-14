declare module 'next/navigation' {
  /**
   * Inserts HTML during server rendering.
   * Only applies to next.js
   */
  export function useServerInsertedHTML(callback: () => React.ReactNode): void;
}
