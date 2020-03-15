import SimpleStylesheet from './simpleStylesheet';
import { SheetCache } from './styleTypes';

let sheets: SimpleStylesheet[] = [];

export default {
  add(sheet: SimpleStylesheet) { sheets.push(sheet); },
  getAll() { return sheets; },
  clean() { sheets = []; },
} as SheetCache;
