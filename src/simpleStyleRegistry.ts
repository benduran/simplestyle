/**
 * Acts as an accumulator for all
 * generated css that occurs via createStyles().
 *
 * React variant of this will come after the baseline one is created
 */
export class SimpleStyleRegistry {
  private sheets: string[] = [];

  add(contents: string) {
    this.sheets.push(contents);
  }

  getCSS() {
    return this.sheets.reduce(
      (prev, contents) => `${prev}
${contents}`,
      '',
    );
  }
}
