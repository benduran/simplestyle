
import { Properties as CSSProperties } from 'csstype';

export interface ISimpleStyleSheet<T> {
  [selector: string]: ISimpleStyleRules<T>;
}

export interface ISimpleStyleRules<T> extends CSSProperties {
  [ruleOrSelector: string]: any;
  $nested?: ISimpleStyleSheet<T>;
}
