
import { Properties } from 'csstype';

export interface SimpleStyleRules {
  [key: string]: Properties | SimpleStyleRules;
}
