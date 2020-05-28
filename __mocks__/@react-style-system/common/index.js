import path from 'path';
import * as Flair from '@flair/common';

const { createFilenameHash, ...rest } = Flair;

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
