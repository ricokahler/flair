const typescript = require('@rollup/plugin-typescript');

const standaloneConfig = { target: 'es2015', module: 'esnext', jsx: 'react' };
const standaloneExternals = [
  'react',
  'classnames',
  'nanoid',
  'stylis',
  'invariant',
  'polished',
];
const nodeConfig = { target: 'es2015', module: 'esnext', jsx: 'react' };
const nodeExternals = [
  'fs',
  'path',
  '@babel/types',
  '@babel/core',
  'common-tags',
  'stylis',
  'require-from-string',
];

module.exports = [
  {
    input: 'src/index.ts',
    output: {
      file: './dist/bundle.esm.js',
      format: 'esm',
      sourcemap: true,
    },
    plugins: [typescript(standaloneConfig)],
    external: standaloneExternals,
  },
  {
    input: 'src/index.ts',
    output: {
      file: './dist/ssr.js',
      format: 'umd',
      name: 'ReactStyleSystem',
      sourcemap: true,
      globals: {
        react: 'React',
        polished: 'polished',
        invariant: 'invariant',
        classnames: 'classNames',
        nanoid: 'nanoId',
        stylis: 'stylis',
      },
    },
    plugins: [typescript(standaloneConfig)],
    external: standaloneExternals,
  },
  {
    input: 'src/index.ts',
    output: {
      file: './dist/bundle.umd.js',
      format: 'umd',
      name: 'ReactStyleSystem',
      sourcemap: true,
      globals: {
        react: 'React',
        polished: 'polished',
        invariant: 'invariant',
        classnames: 'classNames',
        nanoid: 'nanoId',
        stylis: 'stylis',
      },
    },
    plugins: [typescript(standaloneConfig)],
    external: standaloneExternals,
  },
  {
    input: 'src/babel/index.ts',
    output: {
      file: './dist/babel.js',
      format: 'cjs',
      sourcemap: true,
    },
    plugins: [typescript(nodeConfig)],
    external: nodeExternals,
  },
  {
    input: 'src/collect/index.ts',
    output: {
      file: './dist/collect.js',
      format: 'cjs',
      sourcemap: true,
    },
    plugins: [typescript(nodeConfig)],
    external: nodeExternals,
  },
];
