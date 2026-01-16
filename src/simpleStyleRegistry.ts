/* eslint-disable unicorn/prefer-query-selector */
const doc = globalThis.document as
  | typeof globalThis.document
  | null
  | undefined;

/**
 * Acts as an accumulator for all
 * generated css that occurs via createStyles().
 *
 * React variant of this will come after the baseline one is created
 */
export class SimpleStyleRegistry {
  private sheets = new Map<string, string>();

  private _id = performance.now().toString();

  add(ruleId: string, contents: string) {
    if (this.sheets.has(ruleId) && doc) {
      const tag = doc.getElementById(ruleId);
      if (tag) {
        tag.innerHTML = contents;
      }
    }
    this.sheets.set(ruleId, contents);
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
   * unique ID for this registry, based on the time when it was created
   */
  get id() {
    return this._id;
  }
}
