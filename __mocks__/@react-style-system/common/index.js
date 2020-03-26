import path from 'path';
import * as ReactStyleSystem from '@react-style-system/common';

const { createFilenameHash, ...rest } = ReactStyleSystem;

module.exports = {
  createFilenameHash: filename => {
    const extension = path.extname(filename);
    const basename = path.basename(filename);

    return `${path
      .basename(filename)
      .substring(0, basename.length - extension.length)}--00000`;
  },
  ...rest,
};
