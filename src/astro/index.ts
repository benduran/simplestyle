import { makeCssFuncs as _makeCssFuncs } from '../makeStyles.js';
import { makeSimpleStyleProvider } from '../SimpleStyleProvider.js';
import { SimpleStyleRegistry } from '../simpleStyleRegistry.js';

export const makeCssFuncs = (...args: Parameters<typeof _makeCssFuncs>) => {
  const [opts, ...rest] = args;
  const { registry: providedRegistry } = opts;
  const registry = providedRegistry ?? new SimpleStyleRegistry();

  const funcs = _makeCssFuncs({ ...opts, registry }, ...rest);
  return {
    ...funcs,
    SimpleStyleProvider: makeSimpleStyleProvider(registry),
  };
};
