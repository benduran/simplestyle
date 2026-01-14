/* eslint-disable unicorn/prefer-query-selector */
const doc = globalThis.document as
  | typeof globalThis.document
  | null
  | undefined;

type AnyEventName = 'add' | 'settled';

export type SimpleStyleRegistryAddEventCallback = (
  this: SimpleStyleRegistry,
  ruleId: string,
  contents: string,
) => void;

export type SimpleStyleRegistrySettledEventCallback = (
  this: SimpleStyleRegistry,
) => void;

type CallbackEntry =
  | {
      callback: SimpleStyleRegistryAddEventCallback;
      eventName: 'add';
    }
  | {
      callback: SimpleStyleRegistrySettledEventCallback;
      eventName: 'settled';
    };

/**
 * Acts as an accumulator for all
 * generated css that occurs via createStyles().
 *
 * React variant of this will come after the baseline one is created
 */
export class SimpleStyleRegistry {
  private sheets = new Map<string, string>();

  private callbacks: CallbackEntry[] = [];

  private addTimeout: NodeJS.Timeout | null = null;

  add(ruleId: string, contents: string) {
    if (this.sheets.has(ruleId) && doc) {
      const tag = doc.getElementById(ruleId);
      if (tag) {
        tag.innerHTML = contents;
      }
    }
    this.sheets.set(ruleId, contents);
    this.callbacks.forEach((entry) => {
      if (entry.eventName === 'add') {
        entry.callback.call(this, ruleId, contents);
      }
    });

    if (this.addTimeout) {
      clearTimeout(this.addTimeout);
    }
    this.addTimeout = setTimeout(() => {
      this.callbacks.forEach((entry) => {
        if (entry.eventName === 'settled') {
          entry.callback.call(this);
        }
      });
    }, 50);
  }

  /**
   * returns the bare CSS to be injected into a <style /> tag
   */
  getCSS() {
    return this.sheets.values().reduce(
      (prev, contents) => `${prev}
${contents}`,
      '',
    );
  }

  /**
   * returns an HTML string with various <style /> tags
   * mapped to their internal ruleset IDs
   */
  getHTML() {
    return this.sheets.entries().reduce(
      (prev, [ruleId, contents]) => `${prev}
<style id="${ruleId}">${contents}</style>`,
      '',
    );
  }

  /**
   * returns an array of tuples, [string, string][]
   * where the first item in the tuple is the ID for the style rule
   * and the second item is the actual CSS.
   * Use this if you need to fully-control how you're rendering
   * style tags BUT BE SURE TO USE THE ID or else HMR
   * won't work during local development
   */
  getRulesById() {
    return [...this.sheets.entries()];
  }

  /**
   * bind an event handler to one of the various events
   * that occur on the registry
   */
  on<
    E extends AnyEventName,
    Cb = E extends 'add'
      ? SimpleStyleRegistryAddEventCallback
      : E extends 'settled'
        ? SimpleStyleRegistrySettledEventCallback
        : never,
  >(eventName: E, callback: Cb) {
    // @ts-expect-error - gross typings
    this.callbacks.push({ eventName, callback });
  }

  /**
   * disconnects an event handler from the registry.
   * if no callback is specified when calling off,
   * all event handlers are unbound
   */
  off<
    E extends AnyEventName,
    Cb = E extends 'add'
      ? SimpleStyleRegistryAddEventCallback
      : E extends 'settled'
        ? SimpleStyleRegistrySettledEventCallback
        : never,
  >(eventName: E, callback?: Cb) {
    const cbIsFunc = typeof callback === 'function';

    this.callbacks = this.callbacks.filter(
      (entry) =>
        entry.eventName !== eventName &&
        ((cbIsFunc && entry.callback !== callback) || !cbIsFunc),
    );
  }
}
