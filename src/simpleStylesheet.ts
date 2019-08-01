
export default class SimpleStylesheet {
  private sheetBuffer = '';
  private cachedKeySelectorMap: { [classKey: string]: string } = {};

  public raw(raw: string) {
    this.sheetBuffer += raw;
  }

  public addRule(classKey: string, selector: string, style: string, shouldCache: boolean = false) {
    if (classKey && selector) {
      if (this.cachedKeySelectorMap[classKey]) throw new Error(`Class Key clash for ${classKey}`);
      if (shouldCache) this.cachedKeySelectorMap[classKey] = selector;
      if (style) this.sheetBuffer += `${selector}{${style}}`;
    }
  }

  public startMedia(query: string) {
    this.sheetBuffer += `${query}{`;
  }

  public stopMedia() {
    this.sheetBuffer += '}';
  }

  public startKeyframes(name: string) {
    this.sheetBuffer += `@keyframes ${name}{`;
  }

  public stopKeyframes() {
    this.sheetBuffer += '}';
  }

  public addKeyframe(increment: string, formattedRules: string) {
    this.sheetBuffer += `${increment}{${formattedRules}}`;
  }

  public updateNestedSelectors() {
    // We want to replace bigger / longer keys first
    Object.keys(this.cachedKeySelectorMap).sort((a, b) => (a > b ? -1 : a < b ? 1 : 0)).forEach((classKey) => {
      const regex = new RegExp(`\\$${classKey}`, 'gm');
      this.sheetBuffer = this.sheetBuffer.replace(regex, this.cachedKeySelectorMap[classKey]);
    });
  }

  public attach() {
    const stylesheet = document.createElement('style');
    stylesheet.innerHTML = this.sheetBuffer;
    document.head.appendChild(stylesheet);
  }

  public cleanup() {
    this.sheetBuffer = '';
    this.cachedKeySelectorMap = {};
  }

  public getStyles() { return this.sheetBuffer; }
}
