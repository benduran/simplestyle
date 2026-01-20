export const IMPORTS_ENTRY = ['ssjs-imports', []];
export const GLOBALS_ENTRY = ['ssjs-globals', []];
export const STYLES_ENTRY = ['ssjs-styles', []];

/** @type {Map<'ssjs-imports' | 'ssjs-globals' | 'ssjs-styles', string[]>} */
export const COLLECTOR = new Map([IMPORTS_ENTRY, GLOBALS_ENTRY, STYLES_ENTRY]);
