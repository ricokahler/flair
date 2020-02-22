import fs from 'fs';
import path from 'path';
import { transform } from '@babel/core';
import { stripIndent } from 'common-tags';
import { Visitor } from '@babel/traverse';
import * as t from '@babel/types';
import stylis from 'stylis';
import createFileNameHash from 'src/common/createFileNameHash';

function range(n: number) {
  return Array.from(Array(n)).map((_, i) => i);
}

function collectionPlugin(): { visitor: Visitor } {
  let foundCreateStyles = false;

  return {
    visitor: {
      ImportDeclaration(path, state: any) {
        const {
          importSourceValue = 'react-style-system',
          importedName = 'createStyles',
          mockSourceValue,
        } = state.opts;

        const { specifiers, source } = path.node;
        const hasCreateStyles = specifiers.some(node => {
          if (!t.isImportSpecifier(node)) return false;
          return node.imported.name === importedName;
        });
        if (!hasCreateStyles) return;

        const hasPackageName = source.value === importSourceValue;
        if (!hasPackageName) return;

        source.value = mockSourceValue;

        foundCreateStyles = true;
      },

      Program(path, state: any) {
        const { importedName = 'createStyles' } = state.opts;

        const index = path.node.body.findIndex(statement => {
          if (!t.isVariableDeclaration(statement)) return;
          if (!statement.declarations.length) return;

          const isCreateStylesDeclaration = statement.declarations.some(
            declaration => {
              const { init } = declaration;
              if (!t.isCallExpression(init)) return false;
              const { callee } = init;
              if (!t.isIdentifier(callee)) return false;
              if (callee.name !== importedName) return false;
              return true;
            },
          );

          return isCreateStylesDeclaration;
        });

        if (index === -1) return;

        const useStylesDeclaration = path.node.body[
          index
        ] as t.VariableDeclaration;

        path.node.body[index] = t.exportNamedDeclaration(useStylesDeclaration);
      },

      CallExpression(path, state: any) {
        const { importedName = 'createStyles' } = state.opts;

        if (!foundCreateStyles) return;

        const { callee, arguments: expressionArguments } = path.node;
        if (!t.isIdentifier(callee)) return;
        if (callee.name !== importedName) return;

        const [firstArgument] = expressionArguments;

        if (
          !t.isFunctionExpression(firstArgument) &&
          !t.isArrowFunctionExpression(firstArgument)
        ) {
          return;
        }

        const { body } = firstArgument;

        let stylesObjectExpression!: t.ObjectExpression;
        if (t.isObjectExpression(body)) {
          stylesObjectExpression = body;
        } else {
          path.traverse({
            ReturnStatement(path) {
              const { argument } = path.node;

              if (!t.isObjectExpression(argument)) return;
              stylesObjectExpression = argument;
            },
          });
        }

        for (const property of stylesObjectExpression.properties) {
          if (!t.isObjectProperty(property)) return;
          const { value, key } = property;

          if (!t.isTaggedTemplateExpression(value)) return;
          const { tag, quasi } = value;

          if (!t.isIdentifier(tag)) return;
          if (tag.name !== 'css') return;

          const { quasis, expressions } = quasi;

          const templateExpressionPairs = range(quasis.length)
            .map(i => ({
              quasi,
              index: i,
              templateElement: quasis[i],
              expression: expressions[i] as t.Expression | undefined,
            }))
            .filter(({ templateElement }) =>
              templateElement.value.raw.trim().endsWith(':'),
            );

          for (let i = 0; i < templateExpressionPairs.length; i += 1) {
            const {
              index,
              quasi,
            } = templateExpressionPairs[i];

            quasi.expressions[index] = t.stringLiteral(
              `xX__${key.name}__${i}__Xx`,
            );
          }
        }
      },
    },
  };
}

async function collect(filename: string, opts?: any) {
  const code = (await fs.promises.readFile(filename)).toString();
  const { themePath } = opts;

  const tempMockSourceFileName = `${filename}.mockSource.js`;

  const result = transform(code, {
    filename: filename,
    presets: [['babel-preset-react-app', { typescript: true, flow: true }]],
    plugins: [
      [collectionPlugin, { ...opts, mockSourceValue: tempMockSourceFileName }],
    ],
  });

  if (!result?.code) {
    throw new Error('could not transform');
  }

  const extension = path.extname(filename);
  const tempFileName = `${filename}.styles${extension}`;
  try {
    await fs.promises.writeFile(tempFileName, result.code);
    await fs.promises.writeFile(
      tempMockSourceFileName,
      stripIndent`
        function css(strings, ...values) {
          let combined = '';
          for (let i = 0; i < strings.length; i += 1) {
            const currentString = strings[i];
            const currentValue = values[i] || '';
            combined += currentString + currentValue;
          }
          return combined;
        }

        const theme = require(${JSON.stringify(themePath)});
        
        module.exports.createStyles = styleFn => styleFn({ css, theme });
      `,
    );
    const filenameHash = createFileNameHash(filename);
    const { useStyles } = require(tempFileName);

    const finalCss = Object.entries(useStyles)
      .map(([key, value]) => {
        const className = `.${filenameHash}-${key}`;
        return stylis(className, value as string);
      })
      .join('\n')
      .replace(/xX__(\w+)__(\d+)__Xx/g, `var(--${filenameHash}-$1-$2)`);

    return finalCss;
  } catch (e) {
    throw e;
  } finally {
    await fs.promises.unlink(tempFileName);
    await fs.promises.unlink(tempMockSourceFileName);
  }
}

export default collect;
