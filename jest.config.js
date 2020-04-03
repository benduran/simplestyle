module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    '\.ts$': 'ts-jest',
  },
  globals: {
    'ts-jest': {
      tsConfig: './tsconfig.json',
    },
  },
};
