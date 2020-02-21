import { transform } from '@babel/core';
import fs from 'fs';
import path from 'path';
import plugin from './plugin';

it('removes the tagged template literals and replaces it with array expressions', async () => {
  const filename = path.resolve(__dirname, './example.js');
  const code = (await fs.promises.readFile(filename)).toString();

  const result = transform(code, {
    filename,
    presets: [],
    plugins: [plugin],
  });

  expect(result.code).toMatchInlineSnapshot(`
    "\\"use strict\\";

    var _reactStyleSystem = require(\\"react-style-system\\");

    var _polished = require(\\"polished\\");

    const useStyles = (0, _reactStyleSystem.createStyles)(({
      css,
      theme
    }) => ({
      root: [(0, _polished.readableColor)(theme.colors.brand), theme.colors.brand],
      title: [(0, _polished.darken)(0.1, theme.colors.brand)],
      classNamePrefix: \\"example--32e5a416\\"
    }));"
  `);
});
