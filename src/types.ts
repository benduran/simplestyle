import type { Properties } from 'csstype';

export type SimpleStyleRules = {
  [key: string]: Properties | SimpleStyleRules;
};

export type RenderableSimpleStyleRules = SimpleStyleRules &
  Record<string, Properties[]>;

export type HasProperty<T, K extends keyof T> = T extends Record<K, any>
  ? true
  : false;
