import SimpleStylesheet from './simpleStylesheet';

let sheets: SimpleStylesheet[] = [];

export function add(sheet: SimpleStylesheet) {
  sheets.push(sheet);
}

export function getAll() { return sheets; }

export function clean() { sheets = []; }
