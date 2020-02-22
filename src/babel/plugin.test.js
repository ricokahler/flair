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

  expect(result.code).toMatchInlineSnapshot(`
    "\\"use strict\\";

    var _interopRequireDefault = require(\\"/Users/ricokahler/workspace/react-style-system/node_modules/@babel/runtime/helpers/interopRequireDefault\\");

    Object.defineProperty(exports, \\"__esModule\\", {
      value: true
    });
    exports.default = void 0;

    require(\\"/Users/ricokahler/workspace/react-style-system/src/examples/Example--d89a965.css\\");

    var _react = _interopRequireDefault(require(\\"react\\"));

    var _ssr = require(\\"react-style-system/ssr\\");

    var _polished = require(\\"polished\\");

    var _jsxFileName = \\"/Users/ricokahler/workspace/react-style-system/src/examples/Example.js\\";
    const useStyles = (0, _ssr.createStyles)(({
      css,
      theme
    }) => ({
      root: [(0, _polished.readableColor)(theme.colors.brand), theme.colors.brand],
      title: [(0, _polished.darken)(0.1, theme.colors.brand)],
      classNamePrefix: \\"Example--d89a965\\"
    }));

    function MyComponent(props) {
      const {
        Root,
        styles,
        title
      } = useStyles(props);
      return _react.default.createElement(Root, {
        __source: {
          fileName: _jsxFileName,
          lineNumber: 25
        },
        __self: this
      }, _react.default.createElement(\\"h1\\", {
        className: styles.title,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 26
        },
        __self: this
      }, title));
    }

    var _default = MyComponent;
    exports.default = _default;"
  `);
});

it('works with other import names', async () => {
  const filename = require.resolve('../examples/Button');
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
          importSourceValue: 'hacker-ui',
        },
      ],
    ],
  });

  expect(result.code).toMatchInlineSnapshot(`
    "\\"use strict\\";

    var _interopRequireDefault = require(\\"/Users/ricokahler/workspace/react-style-system/node_modules/@babel/runtime/helpers/interopRequireDefault\\");

    Object.defineProperty(exports, \\"__esModule\\", {
      value: true
    });
    exports.default = void 0;

    require(\\"/Users/ricokahler/workspace/react-style-system/src/examples/Button-c5bcd77.css\\");

    var _react = _interopRequireDefault(require(\\"react\\"));

    var _polished = require(\\"polished\\");

    var _ssr = require(\\"hacker-ui/ssr\\");

    var _jsxFileName = \\"/Users/ricokahler/workspace/react-style-system/src/examples/Button.js\\";
    const useStyles = (0, _ssr.createStyles)(({
      css,
      theme
    }) => ({
      root: [theme.colors.brand, (0, _polished.readableColor)(theme.colors.brand)],
      thing: [(0, _polished.readableColor)(theme.colors.brand)],
      classNamePrefix: \\"Button-c5bcd77\\"
    }));

    function Button(props) {
      const {
        Root,
        styles,
        thing
      } = useStyles(props, 'button');
      return _react.default.createElement(Root, {
        __source: {
          fileName: _jsxFileName,
          lineNumber: 20
        },
        __self: this
      }, _react.default.createElement(\\"span\\", {
        className: styles.thing,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 21
        },
        __self: this
      }, thing));
    }

    var _default = Button;
    exports.default = _default;"
  `);
});
