import { Properties } from 'csstype';

export type SimpleStyleRules = {
  [key: string]: Properties | SimpleStyleRules;
};

export type RenderableSimpleStyleRules = SimpleStyleRules & Record<string, Properties[]>;
