import SimpleStylesheet from './simpleStylesheet';
import { ISheetCache } from './styleTypes';

let sheets: SimpleStylesheet[] = [];

export default {
  add(sheet: SimpleStylesheet) { sheets.push(sheet); },
  getAll() { return sheets; },
  clean() { sheets = []; },
} as ISheetCache;
