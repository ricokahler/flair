import * as ReactStyleSystem from '@react-style-system/common';

const { createFilenameHash, ...rest } = ReactStyleSystem;

module.exports = {
  createFilenameHash: () => 'ExampleFile--00000',
  ...rest,
};
