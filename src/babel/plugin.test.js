import fs from 'fs';
import { transform } from '@babel/core';
import plugin from './plugin';

it('removes the tagged template literals and replaces it with array expressions', async () => {
  const filename = require.resolve('src/common/Example');
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

    var _react = _interopRequireDefault(require(\\"react\\"));

    var _reactStyleSystem = require(\\"react-style-system\\");

    var _polished = require(\\"polished\\");

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    const useStyles = (0, _reactStyleSystem.createStyles)(({
      css,
      theme
    }) => ({
      root: [(0, _polished.readableColor)(theme.colors.brand), theme.colors.brand],
      title: [(0, _polished.darken)(0.1, theme.colors.brand)],
      classNamePrefix: \\"Example--1e3a2647\\"
    }));

    function MyComponent(props) {
      const {
        Root,
        styles,
        title
      } = useStyles(props);
      return _react.default.createElement(Root, null, _react.default.createElement(\\"h1\\", {
        className: styles.title
      }, title));
    }

    var _default = MyComponent;
    exports.default = _default;"
  `);
});
