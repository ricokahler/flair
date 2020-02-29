module.exports = {
  rootDir: __dirname,
  moduleNameMapper: {
    '^@react-style-system/(.+)': '<rootDir>/packages/$1/src',
    '^react-style-system$': '<rootDir>/packages/react-style-system',
    '^prettier$': '<rootDir>/node_modules/prettier'
  },
};