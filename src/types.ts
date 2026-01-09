import type { Properties } from 'csstype';

export type Nullish<T> = T | null | undefined;

export type SimpleStyleRules = {
  [key: string]: Properties | SimpleStyleRules;
};

export type RenderableSimpleStyleRules = SimpleStyleRules &
  Record<string, Properties[]>;

export type HasProperty<T, K extends keyof T> = T extends Record<K, any>
  ? true
  : false;

export type ImportStringType = `@import ${string}`;

// re-export this type so we don't run into portability issues here
export type { Properties };
