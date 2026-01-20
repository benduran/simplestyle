import type { Nullish } from '../types.js';

export function createSheet(ruleId: string, sheetContents: string) {
  const out: { existing: boolean | null; styleTag: HTMLElement | null } = {
    existing: null,
    styleTag: null,
  };

  const doc = globalThis.document as
    | Partial<typeof globalThis.document>
    | null
    | undefined;
  if (doc === undefined) return out;
  if (
    typeof doc?.head?.appendChild !== 'function' ||
    typeof doc.createElement !== 'function'
  )
    return out;
  // attempt to reuse the style tag, if it existed
  const existingTag = doc.getElementById?.(ruleId) as Nullish<HTMLStyleElement>;
  const existing = Boolean(existingTag);

  let styleTag: Nullish<HTMLStyleElement> = existingTag;

  if (!styleTag) {
    styleTag = doc.createElement('style');
    styleTag.dataset.simplestyleCreatedAtRuntime = 'true';
  }

  styleTag.id = ruleId;
  styleTag.innerHTML = sheetContents;
  out.existing = existing;
  out.styleTag = styleTag;

  return out;
}
