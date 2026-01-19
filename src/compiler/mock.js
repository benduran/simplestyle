import { createStyles as _createStyles } from '../createStyles.js';
import { COLLECTOR } from './collector.js';

/** @type {typeof _createStyles} */
export const createStyles = (ruleId, rulesFnc, opts) => {
  console.info('mock called!');
  const output = _createStyles(ruleId, rulesFnc, {
    ...opts,
    flush: false,
    registry: false,
  });

  COLLECTOR.push(output.stylesheet);

  // @ts-expect-error - shut it!
  return output;
};
