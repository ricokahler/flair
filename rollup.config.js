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

const getExternal = (name) => [
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
    input: './packages/babel-plugin-plugin/src/index.ts',
    output: {
      file: './dist/babel-plugin-plugin/babel-plugin-plugin.js',
      format: 'cjs',
      sourcemap: true,
    },
    plugins: nodePlugins,
    external: ['fs', 'path', ...getExternal('babel-plugin-plugin')],
  },
  // COLLECT
  {
    input: './packages/collect/src/index.ts',
    output: {
      file: './dist/collect/collect.js',
      format: 'cjs',
      sourcemap: true,
    },
    plugins: nodePlugins,
    external: ['fs', 'path', ...getExternal('collect')],
  },
  // LOADER
  {
    input: './packages/loader/src/index.ts',
    output: [
      {
        file: './dist/loader/loader.js',
        format: 'cjs',
        sourcemap: true,
      },
    ],
    plugins: nodePlugins,
  },
  // LOADER no-op
  {
    input: './packages/loader/src/load.ts',
    output: [
      {
        file: './dist/loader/load.rss-css',
        format: 'cjs',
      },
    ],
    plugins: nodePlugins,
  },
  // COMMON
  {
    input: './packages/common/src/index.ts',
    output: {
      file: './dist/common/common.js',
      format: 'cjs',
      sourcemap: true,
    },
    plugins: nodePlugins,
    external: ['fs', 'path', ...getExternal('common')],
  },
  {
    input: './packages/common/src/index.ts',
    output: {
      file: './dist/common/common.esm.js',
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
      file: './dist/core/core.js',
      format: 'umd',
      sourcemap: true,
      name: 'ReactStyleSystem',
      globals: {
        react: 'React',
        '@ricokahler/parse-to-rgba': 'parseToRgba',
      },
    },
    plugins: umdPlugins,
    external: getExternal('core'),
  },
  {
    input: './packages/core/src/index.ts',
    output: {
      file: './dist/core/core.esm.js',
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
      file: './dist/ssr/ssr.js',
      format: 'umd',
      sourcemap: true,
      name: 'ReactStyleSystem',
      globals: {
        react: 'React',
        '@react-style-system/core': 'ReactStyleSystem',
        classnames: 'classNames',
      },
    },
    plugins: umdPlugins,
    external: getExternal('ssr'),
  },
  {
    input: './packages/ssr/src/index.ts',
    output: {
      file: './dist/ssr/ssr.esm.js',
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
      file: './dist/standalone/standalone.js',
      format: 'umd',
      sourcemap: true,
      name: 'ReactStyleSystem',
      globals: {
        react: 'React',
        '@react-style-system/core': 'ReactStyleSystem',
        classnames: 'classNames',
        uid: 'uid',
        stylis: 'stylis',
      },
    },
    plugins: umdPlugins,
    external: getExternal('standalone'),
  },
  {
    input: './packages/standalone/src/index.ts',
    output: {
      file: './dist/standalone/standalone.esm.js',
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
      file: './dist/react-style-system/root.js',
      format: 'umd',
      sourcemap: true,
      name: 'ReactStyleSystem',
      globals: {
        react: 'React',
        '@react-style-system/standalone': 'ReactStyleSystem',
        classnames: 'classNames',
        uid: 'uid',
        stylis: 'stylis',
      },
    },
    plugins: umdPlugins,
    external: ['@react-style-system/standalone'],
  },
  {
    input: './packages/react-style-system/src/index.ts',
    output: {
      file: './dist/react-style-system/root.esm.js',
      format: 'esm',
      sourcemap: true,
    },
    plugins: esmPlugins,
    external: ['@react-style-system/standalone'],
  },
];
