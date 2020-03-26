import fs from 'fs';
import path from 'path';
import { transform, traverse, parse } from '@babel/core';
import generate from '@babel/generator';
import { seek } from '@react-style-system/common';
import collect from '@react-style-system/collect';
import prettier from 'prettier';
import plugin from './plugin';

it('removes the tagged template literals and replaces it with array expressions', async () => {
  const filename = require.resolve('./Example');
  const code = (await fs.promises.readFile(filename)).toString();

  expect(code).toMatchInlineSnapshot(`
    "import React from 'react';
    import { createStyles } from 'react-style-system';
    import getRed from './submodule';

    const useStyles = createStyles(({ css, theme }) => ({
      root: css\`
        margin: \${theme.space(1)} \${theme.space(2)};
        height: \${theme.block(5)};
        display: flex;
        flex-direction: column;
        transition: background-color \${theme.durations.standard},
          border \${theme.durations.standard};
        overflow: hidden;
        color: \${getRed()};
      \`,
      title: css\`
        \${theme.fonts.h4};
        flex: 0 0 auto;
        /* margin-bottom: calc(50vh - \${theme.space(2)}); */
        color: \${theme.colors.brand};

        \${theme.down(theme.tablet)} {
          \${theme.fonts.h5};
        }
      \`,
      body: css\`
        border-bottom: 1px solid \${theme.colors.danger};
        flex: 1 1 auto;
      \`,
    }));

    function Card(props) {
      const { Root, styles, title, description } = useStyles(props);

      return (
        <Root>
          <h3 className={styles.title}>{title}</h3>
          <p className={styles.body}>{description}</p>
        </Root>
      );
    }

    export default Card;
    "
  `);

  const result = transform(code, {
    babelrc: false,
    filename,
    presets: [
      [
        '@babel/preset-env',
        {
          targets: ['> 5% and last 2 years'],
        },
      ],
    ],
    plugins: [
      [
        plugin,
        {
          themePath: require.resolve('./exampleTheme'),
          cacheDir: path.resolve(__dirname, './__cacheDir__'),
        },
      ],
    ],
  });

  const useStylesAst = seek(report => {
    traverse(parse(result.code, { filename }), {
      VariableDeclaration(path) {
        const [variableDeclarator] = path.node.declarations;
        if (variableDeclarator.id.name !== 'useStyles') return;
        report(path.node);
      },
    });
  });

  const useStylesCode = generate(useStylesAst).code;

  // TODO: remove empty arrays (e.g. `body` is an empty array)
  expect(useStylesCode).toMatchInlineSnapshot(`
    "const useStyles = (0, _ssr.createStyles)(({
      css,
      theme
    }) => ({
      root: [\`\${theme.space(1)} \${theme.space(2)}\`, \`\${theme.block(5)}\`, \`background-color \${theme.durations.standard},
          border \${theme.durations.standard}\`, \`\${(0, _submodule.default)()}\`],
      title: [\`calc(50vh - \${theme.space(2)})\`, \`\${theme.colors.brand}\`],
      body: [\`1px solid \${theme.colors.danger}\`],
      classNamePrefix: \\"Example--00000\\"
    }));"
  `);

  const css = collect(filename, {
    themePath: require.resolve('./exampleTheme'),
    cacheDir: path.resolve(__dirname, './__cacheDir__'),
  });

  const prettyCss = prettier.format(css, {
    parser: 'css',
  });

  expect(prettyCss).toMatchInlineSnapshot(`
".Example--00000-root {
  margin: var(--Example--00000-root-0);
  height: var(--Example--00000-root-1);
  display: flex;
  flex-direction: column;
  transition: var(--Example--00000-root-2);
  overflow: hidden;
  color: var(--Example--00000-root-3);
}
.Example--00000-title {
  font-size: 32px;
  font-weight: bold;
  margin: 0;
  flex: 0 0 auto;
  color: var(--Example--00000-title-1);
}
@media (max-width: 768px) {
  .Example--00000-title {
    font-size: 24px;
    font-weight: bold;
    margin: 0;
  }
}
.Example--00000-body {
  border-bottom: var(--Example--00000-body-0);
  flex: 1 1 auto;
}
"
`);
});
