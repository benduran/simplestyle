import { RenderableSimpleStyleRules, SimpleStyleRules } from './types';

export type PrehookPlugin = (toRender: RenderableSimpleStyleRules) => RenderableSimpleStyleRules;
export type PosthookPlugin = (sheetContents: string) => string;

const prehooks: PrehookPlugin[] = [];
const posthooks: PosthookPlugin[] = [];

export function getPrehooks(): PrehookPlugin[] {
  return prehooks;
}

export function getPosthooks(): PosthookPlugin[] {
  return posthooks;
}

export function registerPrehook(prehook: PrehookPlugin) {
  prehooks.push(prehook);
}

export function registerPosthook(posthook: PosthookPlugin) {
  posthooks.push(posthook);
}
