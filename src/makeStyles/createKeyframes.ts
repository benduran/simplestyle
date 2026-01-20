import type { Properties } from 'csstype';
import { execCreateStyles } from './execCreateStyles.js';
import { flushSheetContents } from './flushSheetContents.js';
import { generateClassName } from './generateClassName.js';
import type { CreateStylesOptions } from './types.js';

export function createKeyframes<T extends Record<string, Properties>>(
  mapId: string,
  ruleId: string,
  framesFnc: () => T,
  options?: CreateStylesOptions,
) {
  const frames = framesFnc();

  const coerced: NonNullable<typeof options> = {
    ...options,
    flush: options?.flush ?? true,
  };
  const keyframeId = generateClassName(mapId, `${ruleId}_keyframes`, frames);

  const { sheetBuffer: keyframesContents } = execCreateStyles(
    mapId,
    keyframeId,
    frames,
    coerced,
    null,
    true,
  );
  const stylesheet = `@keyframes ${keyframeId}{${keyframesContents}}`;
  if (coerced.flush) {
    flushSheetContents(keyframeId, stylesheet);
  }
  return { keyframe: keyframeId, stylesheet };
}
