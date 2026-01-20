import type { Properties } from 'csstype';
import type { Nullish } from '../types.js';

export type CreateStylesOptions = Partial<{
  /**
   * If true, automatically renders generated styles
   * to the DOM in an injected <style /> tag
   */
  flush: boolean;

  /**
   * If set, along with flush: true,
   * will render the injected <style /> after this element
   */
  insertAfter?: Nullish<HTMLElement>;
  /**
   * If set, along with flush: true,
   * will render the injects <style /> before this element
   */
  insertBefore?: Nullish<HTMLElement>;
}>;

export type SimpleStyleRules = {
  [key: string]: Properties | SimpleStyleRules;
};

export type RenderableSimpleStyleRules = SimpleStyleRules &
  Record<string, Properties[]>;

export type ImportStringType = `@import ${string}`;

export type MakeCssFuncsOpts<T extends object | undefined | null> = {
  variables?: T;
};
