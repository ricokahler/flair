import { transform } from '@babel/core';
import { stripIndent } from 'common-tags';
import plugin from './plugin';

it('removes the tagged template literals and replaces it with array expressions', () => {
  const code = stripIndent`
    import { createStyles } from 'react-style-system';
    
    const useStyles = createStyles(({ css, theme }) => {
      return {
        root: css\`
          background-color:\t \${theme.colors.brand}
        \`,
        title: css\`
          width: 50%;

          \${theme.breakpoints.down(theme.breakpoints.desktop)} {
            width: 100%;
          }
        \`,
      };
    });
  `;

  const result = transform(code, {
    filename: 'example.js',
    presets: [],
    plugins: [plugin],
    overrides: [
      {
        plugins: [],
      },
    ],
  });

  expect(result.code).toMatchInlineSnapshot(`
    "\\"use strict\\";

    var _reactStyleSystem = require(\\"react-style-system\\");

    const useStyles = (0, _reactStyleSystem.createStyles)(({
      css,
      theme
    }) => {
      return {
        root: [theme.colors.brand],
        title: []
      };
    });"
  `);
});
