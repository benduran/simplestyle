import path from 'path';

import { Config } from '@jest/types';

const config: Config.InitialOptions = {
  globals: {
    'ts-jest': {
      tsconfig: path.join(__dirname, 'tsconfig.test.json'),
    },
  },
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  testPathIgnorePatterns: [
    '/node_modules/'
  ],
};
export default config;
