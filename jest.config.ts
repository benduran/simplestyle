import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  testPathIgnorePatterns: ['./dist'],
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
};

export default config;
