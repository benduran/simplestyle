/* eslint-disable unicorn/prefer-query-selector */
const doc = globalThis.document as typeof globalThis.document | null | undefined;

/**
 * Acts as an accumulator for all
 * generated css that occurs via createStyles().
 *
 * React variant of this will come after the baseline one is created
 */
export class SimpleStyleRegistry {
  private sheets = new Map<string, string>();

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
}
