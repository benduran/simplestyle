import type { Properties } from 'csstype';

export type SimpleStyleRules = {
  [key: string]: Properties | SimpleStyleRules;
};

export type RenderableSimpleStyleRules = SimpleStyleRules &
  Record<string, Properties[]>;

export type SimpleStyleVariables = {
  [group: string]: {
    [variable: string]: {
      default: string | number;
      [variants: string]: string | number;
    };
  };
};

export type HasProperty<T, K extends keyof T> = T extends Record<K, any>
  ? true
  : false;
