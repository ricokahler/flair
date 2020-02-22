require('ts-node').register('../tsconfig');
const path = require('path');
const reactStylesSystemPlugin = require('src/babel').default;

module.exports = {
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  entry: './src/index.tsx',
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: 'bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.(t|j)sx?/,
        loader: 'babel-loader',
        options: {
          presets: [['react-app', { typescript: true }]],
          plugins: [
            [
              reactStylesSystemPlugin,
              {
                themePath: path.resolve(__dirname, './src/exampleTheme.js'),
                cacheDir: path.resolve(
                  __dirname,
                  './.react-style-system-cache',
                ),
              },
            ],
          ],
        },
        include: [
          path.resolve(__dirname, './src'),
          path.resolve(__dirname, '../src'),
        ],
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.ts', '.tsx', '.css'],
    alias: {
      'react-style-system': path.resolve(__dirname, '../src'),
      'react-style-system/ssr': path.resolve(__dirname, '../src/ssr'),
      src: path.resolve(__dirname, '../src'),
    },
  },
  devtool: 'source-map',
  devServer: {
    contentBase: path.resolve(__dirname, './dist'),
  },
};
