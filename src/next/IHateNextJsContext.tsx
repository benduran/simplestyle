import { createContext } from 'react';
import type { SimpleStyleRegistry } from '../simpleStyleRegistry.js';

export type IHateNextJSProps = { registry: SimpleStyleRegistry };

export const IHateNextJSContext = createContext<IHateNextJSProps | null>(null);
