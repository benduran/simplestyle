import { flushSheetContents } from './flushSheetContents.js';
import type { CreateStylesOptions, ImportStringType } from './types.js';

export function createImports(
  ruleId: string,
  rulesFnc: () => ImportStringType[],
  options?: CreateStylesOptions,
) {
  const coerced: NonNullable<typeof options> = {
    ...options,
    flush: options?.flush ?? true,
  };
  const importRuleId = `${ruleId}_imports`;
  const rules = rulesFnc();

  if (!Array.isArray(rules)) {
    throw new Error(
      'the import() function expects the value returned to be an array of @import strings',
    );
  }

  let sheetBuffer = '';

  for (const importRule of rules) {
    if (!importRule.startsWith('@import')) {
      throw new Error(`found an invalid import string: ${importRule}`);
    }

    sheetBuffer += `${importRule}${importRule.endsWith(';') ? '' : ';'}`;
  }

  if (coerced.flush) {
    flushSheetContents(importRuleId, sheetBuffer, options);
  }

  return { stylesheet: sheetBuffer };
}
