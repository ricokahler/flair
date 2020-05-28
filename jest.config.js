module.exports = {
  rootDir: __dirname,
  moduleNameMapper: {
    '^@flair/(.+)': '<rootDir>/packages/$1/src',
    '^flair$': '<rootDir>/packages/flair/src',
    '^prettier$': '<rootDir>/node_modules/prettier',
  },
  modulePathIgnorePatterns: ['<rootDir>/dist/', '<rootDir>/example-sites/'],
};
