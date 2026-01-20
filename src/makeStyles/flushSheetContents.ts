import { createSheet } from './createSheet.js';
import type { CreateStylesOptions } from './types.js';

export function flushSheetContents(
  ruleId: string,
  sheetContents: string,
  options?: CreateStylesOptions,
) {
  // In case we're in come weird test environment that doesn't support JSDom
  const { existing, styleTag } = createSheet(ruleId, sheetContents);
  // if the tag existed, DO NOT render it back out to the DOM.
  if (existing) return styleTag;
  if (styleTag) {
    if (options?.insertAfter && options.insertBefore) {
      throw new Error(
        'Both insertAfter and insertBefore were provided. Please choose only one.',
      );
    }
    if (typeof options?.insertAfter?.after === 'function') {
      options.insertAfter.after(styleTag as Node);
    } else if (typeof options?.insertBefore?.before === 'function') {
      options.insertBefore.before(styleTag as Node);
    } else {
      document.head.append(styleTag);
    }
  }
  return styleTag;
}
