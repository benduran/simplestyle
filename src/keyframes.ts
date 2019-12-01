
import * as seed from './clasnameSeed';
import createClassName from './createClassName';
import formatCssRule from './formatCssRule';
import sheetCache from './sheetCache';
import SimpleStylesheet from './simpleStylesheet';
import { IRawStyles } from './styleTypes';

export default function keyframes(frameStyles: IRawStyles, flush: boolean = true) {
  const sheet = new SimpleStylesheet();
  sheetCache.add(sheet);
  const s = seed.get();
  seed.increment();
  const name = createClassName(s, 'keyframes');
  sheet.startKeyframes(name);
  Object.keys(frameStyles).forEach((increment) => {
    sheet.addKeyframe(increment, Object.keys(frameStyles[increment]).reduce((prev: string, rule: string) => `${prev}${formatCssRule(rule)}:${frameStyles[increment][rule]};`, ''));
  });
  sheet.stopKeyframes();
  if (flush) {
    sheet.attach();
    sheet.cleanup();
  }
  return name;
}
