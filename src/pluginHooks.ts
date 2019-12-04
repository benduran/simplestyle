import { SimpleStylePluginPostHook, SimpleStylePluginPreHook } from './styleTypes';

let preHooks: SimpleStylePluginPreHook[] = [];
let postHooks: SimpleStylePluginPostHook[] = [];

/**
 * Registers a plugin hook that will be executed before the Simplestyle
 * engine has a chance to perform its transformations from user-provided style
 * definitions to style objects.
 */
export function registerPreHook(fnc: SimpleStylePluginPreHook) {
  preHooks.push(fnc);
}

/**
 * Registers a plugin hook that will be executed after all prehooks have been run,
 * and after the style object has been created (but before it has been written to the DOM)
 */
export function registerPostHook(fnc: SimpleStylePluginPostHook) {
  postHooks.push(fnc);
}

export function getPreHooks() {
  return preHooks;
}

export function getPostHooks() {
  return postHooks;
}

export function clearPreHooks() {
  preHooks = [];
}

export function clearPostHooks() {
  postHooks = [];
}
