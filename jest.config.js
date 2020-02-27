module.exports = {
  rootDir: __dirname,
  moduleNameMapper: {
    '^@react-style-system/(.+)': '<rootDir>/packages/$1/src',
    '^react-style-system$': '<rootDir>/packages/react-style-system',
    '^react$': '<rootDir>/node_modules/react',
  },
};
