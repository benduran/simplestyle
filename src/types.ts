
import { Properties } from 'csstype';

export interface SimpleStyleRules {
  [key: string]: Properties | SimpleStyleRules;
}

export type StyleFnc<T extends SimpleStyleRules, K extends keyof T, O extends { [classname in K]: string }> = (rules: T, ...rest: any[]) => O;

