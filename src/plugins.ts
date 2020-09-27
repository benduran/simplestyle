export type PosthookPlugin = (sheetContents: string) => string;

const posthooks: PosthookPlugin[] = [];

export function getPosthooks(): PosthookPlugin[] {
  return posthooks;
}

export function registerPosthook(posthook: PosthookPlugin) {
  posthooks.push(posthook);
}
