
export default class SimpleStylesheet {
  private sheetBuffer = '';
  private cachedKeySelectorMap: { [classKey: string]: string } = {};

  public addRule(classKey: string, selector: string, style: string, shouldCache: boolean = false) {
    if (classKey && selector && style) {
      if (this.cachedKeySelectorMap[classKey]) throw new Error(`Class Key clash for ${classKey}`);
      if (shouldCache) this.cachedKeySelectorMap[classKey] = selector;
      this.sheetBuffer += `${selector} {${style}}`;
    }
  }

  public updateNestedSelectors() {
    Object.keys(this.cachedKeySelectorMap).forEach((classKey) => {
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
