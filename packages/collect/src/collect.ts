import fs from 'fs';
import { transform } from '@babel/core';
import stylis from 'stylis';
import requireFromString from 'require-from-string';
import { addHook } from 'pirates';
import createFileNameHash from './createFileNameHash';
import collectionPlugin from './collectionPlugin';

function collect(filename: string, opts?: any) {
  const { themePath } = opts;

  if (!themePath) {
    throw new Error('theme path is required');
  }

  const code = fs.readFileSync(filename).toString();

  const _transform = (code: string, filename: string) => {
    const result = transform(code, {
      filename: filename,
      presets: [
        ['@babel/preset-env', { targets: { node: true } }],
        ['@babel/preset-typescript'],
        ['@babel/preset-react'],
      ],
      plugins: [[collectionPlugin, { ...opts }]],
      babelrc: false,
    });

    if (!result?.code) {
      throw new Error('no transform');
    }

    return result.code;
  };

  const revert = addHook(_transform, {
    exts: ['.js', '.ts', '.tsx'],
  });

  const filenameHash = createFileNameHash(filename);
  try {
    const { useStyles } = requireFromString(_transform(code, filename));

    const finalCss = Object.entries(useStyles)
      .map(([key, value]) => {
        const className = `.${filenameHash}-${key}`;
        return stylis(className, value as string);
      })
      .join('\n')
      .replace(/xX__(\w+)__(\d+)__Xx/g, `var(--${filenameHash}-$1-$2)`);

    return finalCss;
  } catch (e) {
    throw e;
  } finally {
    revert();
  }
}

export default collect;
