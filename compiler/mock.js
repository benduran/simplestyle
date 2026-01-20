import { createImports as _createImports } from '../dist/makeStyles/createImports.mjs';
import { createKeyframes as _createKeyframes } from '../dist/makeStyles/createKeyframes.mjs';
import { createRawStyles as _createRawStyles } from '../dist/makeStyles/createRawStyles.mjs';
import { createStyles as _createStyles } from '../dist/makeStyles/createStyles.mjs';
import { makeCssFuncs as _makeCssFuncs } from '../dist/ssr/index.mjs';
import { COLLECTOR } from './collector.js';

export * from '../src/ssr/index.js';

/** @type {typeof _createStyles} */
export const createStyles = (ruleId, rulesFnc, opts) => {
  const output = _createStyles(ruleId, rulesFnc, {
    ...opts,
    flush: false,
    registry: null,
  });

  COLLECTOR.get('ssjs-styles').push(output.stylesheet);

  // @ts-expect-error - shut it!
  return output;
};

/** @type {typeof _createImports} */
export const createImports = (ruleId, rulesFnc, opts) => {
  const output = _createImports(ruleId, rulesFnc, {
    ...opts,
    flush: false,
    registry: null,
  });

  COLLECTOR.get('ssjs-imports').push(output.stylesheet);

  return output;
};

/** @type {typeof _createKeyframes} */
export const createKeyframes = (ruleId, rulesFnc, opts) => {
  const output = _createKeyframes(ruleId, rulesFnc, {
    ...opts,
    flush: false,
    registry: null,
  });

  COLLECTOR.get('ssjs-styles').push(output.stylesheet);

  return output;
};

/** @type {typeof _createRawStyles} */
export const createRawStyles = (ruleId, rulesFnc, opts) => {
  const output = _createRawStyles(ruleId, rulesFnc, {
    ...opts,
    flush: false,
    registry: null,
  });

  COLLECTOR.get('ssjs-globals').push(output.stylesheet);

  return output;
};

/** @type {typeof _makeCssFuncs} */
export const makeCssFuncs = (...args) => {
  const out = _makeCssFuncs(...args);

  const {
    createStyles: localCreateStyles,
    createImports: localCreateImports,
    createKeyframes: localCreateKeyframes,
    createRawStyles: localCreateRawStyles,
  } = out;

  // @ts-expect-error - seriously, stop it
  out.createStyles = (...args) => {
    const result = localCreateStyles(...args);
    COLLECTOR.get('ssjs-styles').push(result.stylesheet);
    return result;
  };
  out.createImports = (...args) => {
    const result = localCreateImports(...args);
    COLLECTOR.get('ssjs-imports').push(result.stylesheet);
    return result;
  };
  out.createKeyframes = (...args) => {
    const result = localCreateKeyframes(...args);
    COLLECTOR.get('ssjs-styles').push(result.stylesheet);
    return result;
  };
  out.createRawStyles = (...args) => {
    const result = localCreateRawStyles(...args);
    COLLECTOR.get('ssjs-globals').push(result.stylesheet);
    return result;
  };

  return out;
};
