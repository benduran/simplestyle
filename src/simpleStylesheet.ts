
export default class SimpleStylesheet {
  private stylesheet = document.createElement('style');
  private sheetBuffer = '';

  public addRule(selector: string, style: string) {
    this.sheetBuffer += `${selector} {${style}}`;
  }

  public attach() {
    this.stylesheet.innerHTML = this.sheetBuffer;
    document.head.appendChild(this.stylesheet);
  }

  public getStyles() { return this.sheetBuffer; }
}
