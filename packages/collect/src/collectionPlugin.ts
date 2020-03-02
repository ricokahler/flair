import _path from 'path';
import * as t from '@babel/types';
import template from '@babel/template';
import { Visitor } from '@babel/traverse';
import { seek, createFilenameHash } from '@react-style-system/common';

export interface Options {
  themePath: string;
  moduleResolver?: any;
}

const importSourceValue = 'react-style-system';
const importedName = 'createStyles';

function range(n: number) {
  return Array.from(Array(n)).map((_, i) => i);
}

function collectionPlugin(): {
  visitor: Visitor<{
    opts: Options;
    file: { opts: { filename: string } };
  }>;
} {
  return {
    visitor: {
      Program(path, state) {
        const { filename } = state.file.opts;
        const filenameHash = createFilenameHash(filename);
        const { themePath } = state.opts;

        if (!themePath) throw new Error('themePath required');

        // Check if this file should be transformed
        const foundCreateStyles = seek<boolean>(report => {
          path.traverse({
            ImportDeclaration(path) {
              const { specifiers, source } = path.node;

              const hasPackageName = source.value === importSourceValue;
              if (!hasPackageName) return;

              const hasCreateStyles = specifiers.some(node => {
                if (!t.isImportSpecifier(node)) return false;
                return node.imported.name === importedName;
              });
              if (!hasCreateStyles) return;

              report(true);
            },
          });

          report(false);
        });
        if (!foundCreateStyles) return;

        // Remove the `createStyles` import
        path.traverse({
          ImportDeclaration(path) {
            const { specifiers, source } = path.node;

            const hasPackageName = source.value === importSourceValue;
            if (!hasPackageName) return;

            path.node.specifiers = specifiers.filter(node => {
              if (!t.isImportSpecifier(node)) return true;

              // return false in this case bc we're removing it
              if (node.imported.name === importedName) return false;

              return true;
            });

            if (path.node.specifiers.length <= 0) {
              path.remove();
            }
          },
        });

        // Add a `createStyles` statement to the top of the body
        path.node.body.unshift(template.statement.ast`
          /**
           * This is a mocked version of \`createStyles\` made to extract the
           * CSS written in it.
           */
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

            const themePath = ${JSON.stringify(themePath)};
            const theme = require(themePath).default || require(themePath);

            // TODO: warn against executing these variables.
            // There should never really need to be a reason to execute these
            // and have their static versions show up in the static CSS
            const color = {
              original: '#000',
              decorative: '#000',
              readable: '#000',
              aa: '#000',
              aaa: '#000',
            };
            const surface = '#fff';

            return () => styleFn({ css, theme, color, surface });
          }
        `);

        // Find the `useStyles` declaration and export it
        path.node.body = path.node.body.map(statement => {
          if (!t.isVariableDeclaration(statement)) return statement;
          if (!statement.declarations.length) return statement;

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
          if (!isCreateStylesDeclaration) return statement;

          // if we get this far, then this is the createStyles declaration
          // and we'll export it
          return t.exportNamedDeclaration(statement);
        });

        // Take all the relative file imports and make them absolute using the
        // filename path
        path.node.body = path.node.body.map(statement => {
          if (!t.isImportDeclaration(statement)) return statement;
          if (!statement.source.value.startsWith('.')) return statement;

          const { source, specifiers } = statement;
          const dirname = _path.dirname(filename);
          const resolved = _path.resolve(dirname, source.value);
          return t.importDeclaration(specifiers, t.stringLiteral(resolved));
        });

        // Transform the body of the createStyles function
        path.traverse({
          CallExpression(path) {
            const { callee, arguments: expressionArguments } = path.node;

            // Find the createStyles invocation
            if (!t.isIdentifier(callee)) return;
            if (callee.name !== importedName) return;

            // ensure that the argument is a function
            const [firstArgument] = expressionArguments;
            if (
              !t.isFunctionExpression(firstArgument) &&
              !t.isArrowFunctionExpression(firstArgument)
            ) {
              return;
            }

            const stylesObjectExpression = seek<t.ObjectExpression>(report => {
              const { body } = firstArgument;

              if (t.isObjectExpression(body)) {
                report(body);
              }

              path.traverse({
                ReturnStatement(path) {
                  const { argument } = path.node;

                  if (!t.isObjectExpression(argument)) return;
                  report(argument);
                },
              });
            });

            // Go through each property and replace it with strings that can be
            // replaced with CSS variables
            stylesObjectExpression.properties = stylesObjectExpression.properties.map(
              property => {
                if (!t.isObjectProperty(property)) return property;

                const { value, key } = property;
                if (!t.isTaggedTemplateExpression(value)) return property;

                const { tag, quasi } = value;
                if (!t.isIdentifier(tag)) return property;
                if (tag.name !== 'css') return property;

                const { quasis, expressions } = quasi;

                let index = 0;
                const replacedExpressions = range(expressions.length)
                  .map(i => ({
                    templateElement: quasis[i],
                    expression: expressions[i],
                  }))
                  .map(({ templateElement, expression }, i) => {
                    if (!templateElement.value.raw.trim().endsWith(':')) {
                      return expression;
                    }

                    const literal = t.stringLiteral(
                      `var(--${filenameHash}-${key.name}-${index})`,
                    );
                    index += 1;
                    return literal;
                  });

                return t.objectProperty(
                  key,
                  t.taggedTemplateExpression(
                    tag,
                    t.templateLiteral(quasis, replacedExpressions),
                  ),
                );
              },
            );
          },
        });
      },
    },
  };
}

export default collectionPlugin;
