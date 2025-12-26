import { makeCssFuncs as _makeCssFuncs } from '../makeStyles.js';
import { makeSimpleStyleProvider } from '../SimpleStyleProvider.js';
import { SimpleStyleRegistry } from '../simpleStyleRegistry.js';

export const makeCssFuncs: typeof _makeCssFuncs = (opts) => {
  const { registry: providedRegistry } = opts;
  const registry = providedRegistry ?? new SimpleStyleRegistry();

  const funcs = _makeCssFuncs({ ...opts, registry });
  return {
    ...funcs,
    SimpleStyleProvider: makeSimpleStyleProvider(registry),
  };
};
