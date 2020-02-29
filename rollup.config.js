const babel = require('rollup-plugin-babel');
const resolve = require('@rollup/plugin-node-resolve');
const { get } = require('lodash');

const extensions = ['.js', '.ts', '.tsx'];

const nodePlugins = [
  resolve({ extensions, preferBuiltins: true }),
  babel({
    babelrc: false,
    presets: [
      ['@babel/preset-env', { targets: { node: true } }],
      '@babel/preset-typescript',
    ],
    extensions,
    include: ['packages/**/*'],
  }),
];

const umdPlugins = [
  resolve({
    extensions,
  }),
  babel({
    babelrc: false,
    presets: [
      '@babel/preset-env',
      '@babel/preset-react',
      '@babel/preset-typescript',
    ],
    runtimeHelpers: true,
    extensions,
  }),
];

const esmPlugins = [
  resolve({
    extensions,
  }),
  babel({
    babelrc: false,
    presets: ['@babel/preset-react', '@babel/preset-typescript'],
    runtimeHelpers: true,
    extensions,
  }),
];

const getExternal = name => [
  ...Object.keys(require(`./packages/${name}/package.json`).dependencies || []),
  ...Object.keys(
    require(`./packages/${name}/package.json`).peerDependencies || [],
  ),
  ...Object.keys(
    get(
      require(`./packages/${name}/tsconfig.json`),
      ['compilerOptions', 'paths'],
      {},
    ),
  ),
];

module.exports = [
  // BABEL
  {
    input: './packages/babel/src/index.ts',
    output: {
      file: './dist/babel/index.js',
      format: 'cjs',
      sourcemap: true,
    },
    plugins: nodePlugins,
    external: ['fs', 'path', ...getExternal('babel')],
  },
  // COLLECT
  {
    input: './packages/collect/src/index.ts',
    output: {
      file: './dist/collect/index.js',
      format: 'cjs',
      sourcemap: true,
    },
    plugins: nodePlugins,
    external: ['fs', 'path', ...getExternal('collect')],
  },
  // COMMON
  {
    input: './packages/common/src/index.ts',
    output: {
      file: './dist/common/index.js',
      format: 'cjs',
      sourcemap: true,
    },
    plugins: nodePlugins,
    external: ['fs', 'path', ...getExternal('common')],
  },
  {
    input: './packages/common/src/index.ts',
    output: {
      file: './dist/common/index.esm.js',
      format: 'esm',
      sourcemap: true,
    },
    plugins: esmPlugins,
    external: ['fs', 'path', ...getExternal('common')],
  },
  // CORE
  {
    input: './packages/core/src/index.ts',
    output: {
      file: './dist/core/index.js',
      format: 'umd',
      sourcemap: true,
      name: 'ReactStyleSystem',
      globals: {
        react: 'React',
        polished: 'polished',
        invariant: 'invariant',
      },
    },
    plugins: umdPlugins,
    external: getExternal('core'),
  },
  {
    input: './packages/core/src/index.ts',
    output: {
      file: './dist/core/index.esm.js',
      format: 'esm',
      sourcemap: true,
    },
    plugins: esmPlugins,
    external: getExternal('core'),
  },

  // SSR
  {
    input: './packages/ssr/src/index.ts',
    output: {
      file: './dist/ssr/index.js',
      format: 'umd',
      sourcemap: true,
      name: 'ReactStyleSystem',
      globals: {
        react: 'React',
        '@react-style-system/core': 'ReactStylesSystem',
        classnames: 'classNames',
      },
    },
    plugins: umdPlugins,
    external: getExternal('ssr'),
  },
  {
    input: './packages/ssr/src/index.ts',
    output: {
      file: './dist/ssr/index.esm.js',
      format: 'esm',
      sourcemap: true,
    },
    plugins: esmPlugins,
    external: getExternal('ssr'),
  },
  // STANDALONE
  {
    input: './packages/standalone/src/index.ts',
    output: {
      file: './dist/standalone/index.js',
      format: 'umd',
      sourcemap: true,
      name: 'ReactStyleSystem',
      globals: {
        react: 'React',
        '@react-style-system/core': 'ReactStylesSystem',
        classnames: 'classNames',
        nanoid: 'nanoId',
        stylis: 'stylis',
      },
    },
    plugins: umdPlugins,
    external: getExternal('standalone'),
  },
  {
    input: './packages/standalone/src/index.ts',
    output: {
      file: './dist/standalone/index.esm.js',
      format: 'esm',
      sourcemap: true,
    },
    plugins: esmPlugins,
    external: getExternal('standalone'),
  },
  // ROOT
  {
    input: './packages/react-style-system/src/index.ts',
    output: {
      file: './dist/react-style-system/index.js',
      format: 'umd',
      sourcemap: true,
      name: 'ReactStyleSystem',
      globals: {
        react: 'React',
        '@react-style-system/standalone': 'ReactStylesSystem',
        classnames: 'classNames',
        nanoid: 'nanoId',
        stylis: 'stylis',
      },
    },
    plugins: umdPlugins,
    external: ['@react-style-system/standalone'],
  },
  {
    input: './packages/react-style-system/src/index.ts',
    output: {
      file: './dist/react-style-system/index.esm.js',
      format: 'esm',
      sourcemap: true,
    },
    plugins: esmPlugins,
    external: ['@react-style-system/standalone'],
  },
];
