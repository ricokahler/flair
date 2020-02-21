import { transform } from '@babel/core';
import fs from 'fs';
import path from 'path';
import plugin from './plugin';

it('removes the tagged template literals and replaces it with array expressions', async () => {
  const filename = path.resolve(__dirname, './example.js');
  const code = (await fs.promises.readFile(filename)).toString();

  const result = transform(code, {
    filename,
    presets: [
      ['@babel/preset-env', { targets: { node: true } }],
      ['@babel/preset-react'],
    ],
    plugins: [plugin],
  });

  expect(result.code).toMatchInlineSnapshot(`
    "\\"use strict\\";

    Object.defineProperty(exports, \\"__esModule\\", {
      value: true
    });
    exports.default = void 0;

    var _reactStyleSystem = require(\\"react-style-system\\");

    var _polished = require(\\"polished\\");

    const useStyles = (0, _reactStyleSystem.createStyles)(({
      css,
      theme
    }) => ({
      root: [(0, _polished.readableColor)(theme.colors.brand), theme.colors.brand],
      title: [(0, _polished.darken)(0.1, theme.colors.brand)],
      classNamePrefix: \\"example--32e5a416\\"
    }));

    function MyComponent(props) {
      const {
        Root,
        styles,
        title
      } = useStyles(props);
      return React.createElement(Root, null, React.createElement(\\"h1\\", {
        className: styles.title
      }, title));
    }

    var _default = MyComponent;
    exports.default = _default;"
  `);
});
