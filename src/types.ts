import type { Properties } from 'csstype';

export type Nullish<T> = T | null | undefined;

export type HasProperty<T, K extends keyof T> = T extends Record<K, any>
  ? true
  : false;

// re-export this type so we don't run into portability issues here
export type { Properties };
