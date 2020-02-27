import { transform } from '@babel/core';
import { stripIndent } from 'common-tags';
import plugin from './collectionPlugin';

it('transforms the given code so that useStyles is exported', () => {
  const code = stripIndent`
    import { createStyles, createReadablePalette } from 'react-style-system';
    import { readableColor } from 'polished';
    import { doThing } from './localModule';

    const useStyles = createStyles(({ css, theme }) => {
      const danger = createReadablePalette(theme.colors.danger);

      return {
        root: css\`
          color: \${danger.readable};
          background-color: \${readableColor(danger.readable)};
          width: 50%;

          \${doThing(theme.colors.brand)};

          \${theme.down(theme.tablet)} {
            width: 100%;
          }

          margin: \${theme.space(0)};
        \`,
      };
    });
  `;

  const result = transform(code, {
    filename: '/usr/example/blah/Example.js',
    babelrc: false,
    plugins: [
      [
        plugin,
        {
          themePath: '/usr/theme/exampleTheme.js',
        },
      ],
    ],
  });

  expect(result.code).toMatchInlineSnapshot(`
    "\\"use strict\\";

    Object.defineProperty(exports, \\"__esModule\\", {
      value: true
    });
    exports.useStyles = void 0;

    var _reactStyleSystem = require(\\"react-style-system\\");

    var _polished = require(\\"polished\\");

    var _localModule = require(\\"/usr/example/blah/localModule\\");

    const createStyles = styleFn => {
      function css(strings, ...values) {
        let combined = '';

        for (let i = 0; i < strings.length; i += 1) {
          const currentString = strings[i];
          const currentValue = values[i] || '';
          combined += currentString + currentValue;
        }

        return combined;
      }

      const themePath = \\"/usr/theme/exampleTheme.js\\";

      const theme = require(themePath).default || require(themePath);

      const color = {
        original: '#000',
        decorative: '#000',
        readable: '#000',
        aa: '#000',
        aaa: '#000'
      };
      const surface = '#fff';
      return () => styleFn({
        css,
        theme,
        color,
        surface
      });
    };

    const useStyles = createStyles(({
      css,
      theme
    }) => {
      const danger = (0, _reactStyleSystem.createReadablePalette)(theme.colors.danger);
      return {
        root: css\`
          color: \${\\"var(--Example--3d512064-root-0)\\"};
          background-color: \${\\"var(--Example--3d512064-root-1)\\"};
          width: 50%;

          \${(0, _localModule.doThing)(theme.colors.brand)};

          \${theme.down(theme.tablet)} {
            width: 100%;
          }

          margin: \${\\"var(--Example--3d512064-root-2)\\"};
        \`
      };
    });
    exports.useStyles = useStyles;"
  `);
});
