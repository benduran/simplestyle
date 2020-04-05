
import { Properties } from 'csstype';

export interface SimpleStyleRules {
  [key: string]: Properties | SimpleStyleRules;
}

export type RenderableSimpleStyleRules = SimpleStyleRules & { [selector: string]: Properties[] };
