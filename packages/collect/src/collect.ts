import fs from 'fs';
import stylis from 'stylis';
import * as babel from '@babel/core';
import { addHook } from 'pirates';
import { createFilenameHash } from '@react-style-system/common';
import requireFromString from 'require-from-string';
import collectionPlugin, { Options } from './collectionPlugin';

stylis.set({
  compress: true,
  prefix: false,
});

function collect(filename: string, opts: Options) {
  const { themePath } = opts;
  const filenameHash = createFilenameHash(filename);

  if (!themePath) {
    throw new Error('theme path is required');
  }

  const code = fs.readFileSync(filename).toString();

  function attempt<T>(fn: () => T, errorMessage: string) {
    try {
      return fn();
    } catch (e) {
      throw new Error(`[${filename}] ${errorMessage}: ${e?.message}`);
    }
  }

  const babelConfig = (filename: string) => ({
    filename,
    presets: [
      ['@babel/preset-env', { targets: { node: 'current' } }],
      ['@babel/preset-typescript'],
      ['@babel/preset-react'],
    ],
    plugins: [
      '@babel/plugin-proposal-class-properties',
      [collectionPlugin, opts],
      ...(opts.moduleResolver
        ? [['module-resolver', opts.moduleResolver]]
        : []),
    ],
    babelrc: false,
  });

  const revert = addHook(
    (code: string, filename: string) => {
      const result = babel.transform(code, babelConfig(filename));

      if (!result?.code) {
        throw new Error('no transform');
      }

      return result.code;
    },
    { exts: ['.js', '.ts', '.tsx'] },
  );

  try {
    const transformedCode = attempt(() => {
      const result = babel.transform(
        `require('@babel/polyfill');\n${code}`,
        babelConfig(filename),
      );

      if (!result?.code) {
        throw new Error('no transform');
      }

      return result.code;
    }, 'Failed to transform');

    const stylesToPull = attempt(
      () =>
        (() => {
          const result = requireFromString(transformedCode);
          return Object.values(result).filter(
            (maybeFn: any) => maybeFn.__cssExtractable,
          ) as Array<() => { [key: string]: string }>;
        })(),
      'Failed to execute file',
    );

    const unprocessedCss = attempt(() => {
      return stylesToPull.map(fn => fn());
    }, 'Failed to evaluate CSS strings') as Array<{ [key: string]: string }>;

    const finalCss = attempt(
      () =>
        unprocessedCss
          .map((styleObj, index) =>
            Object.entries(styleObj)
              .filter(([_key, value]) => typeof value === 'string')
              .map(([key, value]) => {
                const className = `.${filenameHash}-${index}-${key}`;
                return stylis(className, value as string);
              })
              .join('\n'),
          )
          .join('\n'),
      'Failed to process styles',
    );

    return finalCss;
  } catch (e) {
    throw e;
  } finally {
    revert();
  }
}

export default collect;
