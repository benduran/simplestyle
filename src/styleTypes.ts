
import { Properties as CSSProperties } from 'csstype';

import SimpleStylesheet from './simpleStylesheet';

export interface ISheetCache {
  add: (sheet: SimpleStylesheet) => void;
  clean: () => void;
  getAll: () => SimpleStylesheet[];
}

export interface ISimpleStyleSheet<T> {
  [selector: string]: ISimpleStyleRules<T>;
}

export interface ISimpleStyleRules<T> extends CSSProperties {
  [ruleOrSelector: string]: any;
}

export interface IIndexableCSSProperties extends CSSProperties {
  [rule: string]: any;
}

export interface IRawStyles {
  [rawSelector: string]: IIndexableCSSProperties;
}

export type SimpleStylePluginPreHook = <T>(sheet: SimpleStylesheet, rules: ISimpleStyleRules<T>, sheetCache: ISheetCache) => ISimpleStyleRules<T>;
export type SimpleStylePluginPostHook = <T>(sheet: SimpleStylesheet, rules: ISimpleStyleRules<T>, generatedSelector: string, sheetCache: ISheetCache) => void;
