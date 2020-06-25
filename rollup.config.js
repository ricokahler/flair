import babel from '@rollup/plugin-babel';
import resolve from '@rollup/plugin-node-resolve';
import { get } from 'lodash';

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
    babelHelpers: 'bundled',
    extensions,
  }),
];

const esmPlugins = [
  resolve({
    extensions,
    modulesOnly: true,
  }),
  babel({
    babelrc: false,
    presets: ['@babel/preset-react', '@babel/preset-typescript'],
    plugins: ['@babel/plugin-transform-runtime'],
    babelHelpers: 'runtime',
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
  // mark all babel runtime deps are external
  ...(require(`./packages/${name}/package.json`).dependencies['@babel/runtime']
    ? [/^@babel\/runtime/]
    : []),
];

module.exports = [
  // BABEL
  {
    input: './packages/babel-plugin-plugin/src/index.ts',
    output: {
      file: './dist/babel-plugin-plugin/index.js',
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
      file: './dist/collect/index.js',
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
        file: './dist/loader/index.js',
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
      name: 'Flair',
      globals: {
        react: 'React',
        color2k: 'color2k',
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
      name: 'Flair',
      globals: {
        react: 'React',
        '@flair/core': 'Flair',
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
      name: 'Flair',
      globals: {
        react: 'React',
        '@flair/core': 'Flair',
        classnames: 'classNames',
        uid: 'uid',
        stylis: 'stylis',
        color2k: 'color2k',
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
    input: './packages/flair/src/index.ts',
    output: {
      file: './dist/flair/index.js',
      format: 'umd',
      sourcemap: true,
      name: 'Flair',
      globals: {
        react: 'React',
        '@flair/standalone': 'Flair',
        classnames: 'classNames',
        uid: 'uid',
        stylis: 'stylis',
        color2k: 'color2k',
      },
    },
    plugins: umdPlugins,
    external: ['@flair/standalone'],
  },
  {
    input: './packages/flair/src/index.ts',
    output: {
      file: './dist/flair/index.esm.js',
      format: 'esm',
      sourcemap: true,
    },
    plugins: esmPlugins,
    external: ['@flair/standalone'],
  },
];
