import _path from 'path';
import { stripIndent } from 'common-tags';
import { Visitor } from '@babel/traverse';
import * as t from '@babel/types';

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
          themePath,
        } = state.opts;

        if (!themePath) throw new Error('themePath required');

        const { specifiers, source } = path.node;
        const hasCreateStyles = specifiers.some(node => {
          if (!t.isImportSpecifier(node)) return false;
          return node.imported.name === importedName;
        });
        if (!hasCreateStyles) return;

        const hasPackageName = source.value === importSourceValue;
        if (!hasPackageName) return;

        foundCreateStyles = true;

        path.replaceWithSourceString(stripIndent`
          createStyles = styleFn => {
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
            
            return styleFn({ css, theme });
          }
        `);
      },

      Program(path, state: any) {
        const { filename } = state.file.opts;
        const { importedName = 'createStyles' } = state.opts;

        const index = path.node.body.findIndex(statement => {
          if (!t.isVariableDeclaration(statement)) return false;
          if (!statement.declarations.length) return false;

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

        path.node.body.unshift(
          t.variableDeclaration('let', [
            t.variableDeclarator(t.identifier('createStyles'), null),
          ]),
        );

        const relativeImportStatements = path.node.body
          .map((statement, index) => ({ statement, index }))
          .filter(({ statement }) => {
            if (!t.isImportDeclaration(statement)) return false;
            return statement.source.value.startsWith('.');
          });

        for (const { statement } of relativeImportStatements) {
          if (!t.isImportDeclaration(statement)) continue;
          const dirname = _path.dirname(filename);
          const resolved = _path.resolve(dirname, statement.source.value);
          statement.source.value = resolved;
        }
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
            const { index, quasi } = templateExpressionPairs[i];

            quasi.expressions[index] = t.stringLiteral(
              `xX__${key.name}__${i}__Xx`,
            );
          }
        }
      },
    },
  };
}

export default collectionPlugin;
