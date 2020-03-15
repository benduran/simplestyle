
import { Properties as CSSProperties } from 'csstype';

import SimpleStylesheet from './simpleStylesheet';

export interface SheetCache {
  add: (sheet: SimpleStylesheet) => void;
  clean: () => void;
  getAll: () => SimpleStylesheet[];
}

export interface SimpleStyleSheet<T> {
  [selector: string]: SimpleStyleRules<T>;
}

export interface SimpleStyleRules<T> extends CSSProperties {
  [ruleOrSelector: string]: any;
}

export interface IndexableCSSProperties extends CSSProperties {
  [rule: string]: any;
}

export interface RawStyles {
  [rawSelector: string]: IndexableCSSProperties;
}

export type SimpleStylePluginPreHook = <T>(sheet: SimpleStylesheet, rules: SimpleStyleRules<T>, sheetCache: SheetCache) => SimpleStyleRules<T>;
export type SimpleStylePluginPostHook = <T>(sheet: SimpleStylesheet, rules: SimpleStyleRules<T>, generatedSelector: string, sheetCache: SheetCache) => void;
