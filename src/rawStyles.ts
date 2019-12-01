import formatCssRule from './formatCssRule';
import sheetCache from './sheetCache';
import SimpleStyleSheet from './simpleStylesheet';
import { IRawStyles } from './styleTypes';

export default function rawStyles(
  raw: IRawStyles,
  flush: boolean = true,
  sheet: SimpleStyleSheet = new SimpleStyleSheet(),
) {
  if (!raw) throw new Error('Unable to add empty raw styles');
  if (!sheet) throw new Error('Unable to add raw styles because no sheet was provided');
  Object.keys(raw).forEach((selector) => {
    sheet.raw(
      `${selector}{${Object.keys(raw[selector]).reduce(
        (prev: string, rule: string) =>
          `${prev}${formatCssRule(rule)}:${raw[selector][rule]};`,
        '',
      )}}`,
    );
  });
  sheetCache.add(sheet);
  if (flush) sheet.attach();
  return sheet;
}
