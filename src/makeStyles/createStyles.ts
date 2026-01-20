import merge from 'deepmerge';
import { getPosthooks } from '../plugins.js';
import { execCreateStyles } from './execCreateStyles.js';
import { flushSheetContents } from './flushSheetContents.js';
import type { CreateStylesOptions, SimpleStyleRules } from './types.js';

function replaceBackReferences<O extends Record<string, string>>(
  out: O,
  sheetContents: string,
): string {
  let outputSheetContents = sheetContents;
  const toReplace: string[] = [];
  const toReplaceRegex = /\$\w([a-zA-Z0-9_-]+)?/gm;
  let matches = toReplaceRegex.exec(outputSheetContents);
  while (matches) {
    toReplace.push(matches[0].valueOf());
    matches = toReplaceRegex.exec(outputSheetContents);
  }
  for (const r of toReplace) {
    outputSheetContents = outputSheetContents.replace(
      r,
      `.${out[r.slice(1)] ?? ''}`,
    );
  }
  return getPosthooks().reduce((prev, hook) => hook(prev), outputSheetContents);
}

export function createStyles<
  T extends SimpleStyleRules,
  K extends keyof T,
  O extends Record<K, string>,
>(
  mapId: string,
  ruleId: string,
  rulesFnc: () => T,
  options?: Partial<CreateStylesOptions>,
) {
  const rules = rulesFnc();
  const coerced: NonNullable<typeof options> = {
    ...options,
    flush: options?.flush ?? true,
  };

  const {
    classes: out,
    sheetBuffer: sheetContents,
    mediaQueriesBuffer: mediaQueriesContents,
  } = execCreateStyles(mapId, ruleId, rules, coerced, null);

  const mergedContents = `${sheetContents}${mediaQueriesContents}`;

  const replacedSheetContents = replaceBackReferences(out, mergedContents);

  let sheet: ReturnType<typeof flushSheetContents> = null;

  const updateSheet = <T2 extends SimpleStyleRules>(
    updatedRulesFnc: () => Partial<T2>,
  ) => {
    if (options?.flush || !options?.flush) {
      // We prefer the first set, and then we shallow merge
      const {
        classes: updatedOut,
        sheetBuffer: updatedSheetContents,
        mediaQueriesBuffer: updatedMediaQueriesContents,
      } = execCreateStyles(
        mapId,
        ruleId,
        merge(rules, updatedRulesFnc()),
        { flush: false },
        null,
      );

      const updatedMergedContents = `${updatedSheetContents}${updatedMediaQueriesContents}`;

      const updatedReplacedSheetContents = replaceBackReferences(
        out,
        updatedMergedContents,
      );

      if (sheet) sheet.innerHTML = updatedReplacedSheetContents;

      return { classes: updatedOut, stylesheet: updatedSheetContents } as {
        classes: typeof updatedOut;
        stylesheet: string;
      };
    }
    return null;
  };

  if (coerced.flush) {
    sheet = flushSheetContents(ruleId, replacedSheetContents, options);
  }
  // Need this TS cast to get solid code assist from the consumption-side
  return {
    classes: out as unknown,
    stylesheet: replacedSheetContents,
    updateSheet,
  } as {
    classes: O;
    stylesheet: string;
    updateSheet: typeof updateSheet;
  };
}
