import fs from 'fs';
import path from 'path';
import { transform, traverse, parse } from '@babel/core';
import generate from '@babel/generator';
import { seek } from '@react-style-system/common';
import plugin from './plugin';

it('removes the tagged template literals and replaces it with array expressions', async () => {
  const filename = require.resolve('./Example');
  const code = (await fs.promises.readFile(filename)).toString();

  const result = transform(code, {
    babelrc: false,
    filename,
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

  expect(useStylesCode).toMatchInlineSnapshot(`
    "const useStyles = (0, _ssr.createStyles)(({
      css,
      theme,
      staticVar
    }) => ({
      root: [theme.block(5), (0, _submodule.default)()],
      title: [theme.space(1), theme.colors.brand],
      body: [],
      classNamePrefix: \\"Example--00000\\"
    }));"
  `);
});
