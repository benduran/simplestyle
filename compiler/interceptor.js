/** @typedef {import('node:module').ResolveHookContext} ResolveContext */
/** @typedef {import('node:module').ResolveFnOutput} ResolveFnOutput */

/**
 * @callback NextResolve
 * @param {string} specifier
 * @param {ResolveContext} [context]
 * @returns {Promise<ResolveFnOutput>}
 */

/**
 * @typedef {Object} ResolveHookOutput
 * @property {boolean} [shortCircuit]
 * @property {string} url
 * @property {string} [format]
 */

/**
 * @type {(
 * specifier: string,
 * context: ResolveContext,
 * nextResolve: NextResolve
 * ) => Promise<ResolveFnOutput>}
 */
export const resolve = async (specifier, context, nextResolve) => {
  const isCreateStylesPath =
    specifier === 'simplestyle-js/createStyles' ||
    specifier.endsWith('/createStyles.ts') ||
    specifier.endsWith('/createStyles.mjs') ||
    specifier.endsWith('/createStyles.js');

  const isSimpleStyleRoot = specifier === 'simplestyle-js';

  if (isSimpleStyleRoot || isCreateStylesPath) {
    return {
      shortCircuit: true,
      url: new URL('./mock.js', import.meta.url).href,
      format: 'module',
    };
  }
  return nextResolve(specifier, context);
};
