
import { Properties as CSSProperties } from 'csstype';
import SimpleStylesheet from './simpleStylesheet';

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

export type SimpleStylePluginPreHook = <T>(sheet: SimpleStylesheet, rules: ISimpleStyleRules<T>) => ISimpleStyleRules<T>;
export type SimpleStylePluginPostHook = <T>(sheet: SimpleStylesheet, rules: ISimpleStyleRules<T>, generatedClassName?: string) => ISimpleStyleRules<T>;
