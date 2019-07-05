
import { Properties as CSSProperties } from 'csstype';

export interface ISimpleStyleRules<T> extends CSSProperties {
  $nested?: {
    [selector: string]: T;
  };
}
