import fs from 'fs';
import path from 'path';
import { transform } from '@babel/core';
import plugin from './plugin';

it('removes the tagged template literals and replaces it with array expressions', async () => {
  const filename = require.resolve('../examples/Example');
  const code = (await fs.promises.readFile(filename)).toString();

  const result = transform(code, {
    filename,
    presets: [
      ['@babel/preset-env', { targets: { node: true } }],
      ['@babel/preset-react'],
    ],
    plugins: [
      [
        plugin,
        {
          themePath: require.resolve('../examples/exampleStaticTheme'),
          cacheDir: path.resolve(__dirname, '../examples'),
        },
      ],
    ],
  });

  expect(result.code).toMatchSnapshot();
});
