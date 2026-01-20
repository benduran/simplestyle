import { makeCssFuncs as _makeCssFuncs } from '../makeStyles.js';
import {
  createStyles as _createStyles,
  imports as _imports,
  keyframes as _keyframes,
  rawStyles as _rawStyles,
} from '../ssr/index.js';
import { COLLECTOR } from './collector.js';

export * from '../ssr/index.js';

/** @type {typeof _createStyles} */
export const createStyles = (ruleId, rulesFnc, opts) => {
  console.info('mock called!');
  const output = _createStyles(ruleId, rulesFnc, {
    ...opts,
    flush: false,
    registry: null,
  });

  COLLECTOR.push(output.stylesheet);

  // @ts-expect-error - shut it!
  return output;
};

/** @type {typeof _imports} */
export const imports = (ruleId, rulesFnc, opts) => {
  const output = _imports(ruleId, rulesFnc, {
    ...opts,
    flush: false,
    registry: null,
  });

  COLLECTOR.push(output.stylesheet);

  return output;
};

/** @type {typeof _keyframes} */
export const keyframes = (ruleId, rulesFnc, opts) => {
  const output = _keyframes(ruleId, rulesFnc, {
    ...opts,
    flush: false,
    registry: null,
  });

  COLLECTOR.push(output.stylesheet);

  return output;
};

/** @type {typeof _rawStyles} */
export const rawStyles = (ruleId, rulesFnc, opts) => {
  const output = _rawStyles(ruleId, rulesFnc, {
    ...opts,
    flush: false,
    registry: null,
  });

  COLLECTOR.push(output.stylesheet);

  return output;
};

/** @type {typeof _makeCssFuncs} */
export const makeCssFuncs = (...args) => {
  const out = _makeCssFuncs(...args);

  const {
    createStyles: localCreateStyles,
    imports: localImports,
    keyframes: localKeyframes,
    rawStyles: localRawStyles,
  } = out;

  // @ts-expect-error - seriously, stop it
  out.createStyles = (...args) => {
    const result = localCreateStyles(...args);
    COLLECTOR.push(result.stylesheet);

    return result;
  };
  out.imports = (...args) => {
    const result = localImports(...args);
    COLLECTOR.push(result.stylesheet);
    return result;
  };
  out.keyframes = (...args) => {
    const result = localKeyframes(...args);
    COLLECTOR.push(result.stylesheet);
    return result;
  };
  out.rawStyles = (...args) => {
    const result = localRawStyles(...args);
    COLLECTOR.push(result.stylesheet);
    return result;
  };

  return out;
};
