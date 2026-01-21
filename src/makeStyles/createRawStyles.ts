import { execCreateStyles } from './execCreateStyles.js';
import { flushSheetContents } from './flushSheetContents.js';
import type { CreateStylesOptions, SimpleStyleRules } from './types.js';

export function createRawStyles<T extends SimpleStyleRules>(
  ruleId: string,
  rulesFnc: () => T,
  options?: Partial<CreateStylesOptions>,
) {
  const coerced: NonNullable<typeof options> = {
    ...options,
    flush: options?.flush ?? true,
  };

  const rawStylesId = `${ruleId}_raw`;
  const rules = rulesFnc();

  const {
    sheetBuffer: sheetContents,
    mediaQueriesBuffer: mediaQueriesContents,
  } = execCreateStyles(rawStylesId, rules, coerced, null, true);

  const mergedContents = `${sheetContents}${mediaQueriesContents}`;

  if (coerced.flush) {
    flushSheetContents(rawStylesId, mergedContents, options);
  }
  return { stylesheet: mergedContents };
}
