import _path from 'path';
import * as t from '@babel/types';
import template from '@babel/template';
import { Visitor } from '@babel/traverse';
import { seek, createFilenameHash } from '@flair/common';
import transformCssTemplateLiteral from './transformCssTemplateLiteral';

export interface Options {
  themePath: string;
  moduleResolver?: any;
  ignoreImportPattern?: string;
}

const importSourceValue = 'flair';
const importedName = 'createStyles';

function collectionPlugin(): {
  visitor: Visitor<{
    opts: Options;
    file: { opts: { filename: string } };
  }>;
} {
  return {
    visitor: {
      Program(path, state) {
        /**
         * this is used to match the `useStyle` index. because we allow more than one
         * `createStyles` call, we need to keep track of what number this one is.
         */
        let useStyleIndex = 0;

        const { filename } = state.file.opts;
        const filenameHash = createFilenameHash(filename);
        const {
          themePath,
          ignoreImportPattern = '\\.((css)|(scss))$',
        } = state.opts;

        if (!themePath) throw new Error('themePath required');

        // remove ignored import statement
        path.node.body = path.node.body.filter((statement) => {
          if (!t.isImportDeclaration(statement)) return true;

          const { source } = statement;
          const match = new RegExp(ignoreImportPattern).exec(source.value);
          if (!match) return true;

          return false;
        });

        // Check if this file should be transformed
        const foundCreateStyles = seek<boolean>((report) => {
          path.traverse({
            ImportDeclaration(path) {
              const { specifiers, source } = path.node;

              const hasPackageName = source.value === importSourceValue;
              if (!hasPackageName) return;

              const hasCreateStyles = specifiers.some((node) => {
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

            path.node.specifiers = specifiers.filter((node) => {
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

            return () => styleFn({ css, theme, color, surface, staticVar });
          }
        `);

        path.node.body.unshift(
          template.statement.ast`const staticVar = t => t;`,
        );

        // Find the `useStyles` declaration and export it
        path.node.body = path.node.body
          .map((statement) => {
            if (!t.isVariableDeclaration(statement)) return statement;
            if (!statement.declarations.length) return statement;

            const createStylesDeclarations = statement.declarations.filter(
              (declaration) => {
                const { init, id } = declaration;
                if (!t.isIdentifier(id)) return false;
                if (!t.isCallExpression(init)) return false;
                const { callee } = init;
                if (!t.isIdentifier(callee)) return false;

                if (callee.name !== importedName) return false;
                return true;
              },
            );
            if (createStylesDeclarations.length <= 0) return statement;
            const variableNames = createStylesDeclarations.map(
              (declaration) => {
                const { id } = declaration;
                if (!t.isIdentifier(id)) {
                  throw new Error(
                    `Expected to find identifier but found "${id.type}"`,
                  );
                }

                return id.name;
              },
            );

            // if we get this far, then this is the createStyles declaration
            // and we'll export it
            return [
              t.exportNamedDeclaration(statement),
              ...variableNames.map(
                (name) =>
                  template.statement.ast`${name}.__cssExtractable = true;`,
              ),
            ];
          })
          .flat();

        // Take all the relative file imports and make them absolute using the
        // filename path
        path.node.body = path.node.body.map((statement) => {
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

            const stylesObjectExpression = seek<t.ObjectExpression>(
              (report) => {
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
              },
            );

            // Go through each property and replace it with strings that can be
            // replaced with CSS variables
            stylesObjectExpression.properties = stylesObjectExpression.properties.map(
              (property) => {
                if (!t.isObjectProperty(property)) return property;

                const { value, key } = property;
                if (!t.isTaggedTemplateExpression(value)) return property;

                const { tag, quasi } = value;
                if (!t.isIdentifier(tag)) return property;
                if (tag.name !== 'css') return property;

                const transformedQuasi = transformCssTemplateLiteral(quasi);

                let index = 0;
                const transformedExpressions = transformedQuasi.expressions.map(
                  (expression) => {
                    if (
                      t.isCallExpression(expression) &&
                      t.isIdentifier(expression.callee) &&
                      expression.callee.name === 'staticVar'
                    ) {
                      return expression;
                    }

                    const ret = t.stringLiteral(
                      `var(--${filenameHash}-${useStyleIndex}-${key.name}-${index})`,
                    );

                    index += 1;

                    return ret;
                  },
                );

                const final = t.taggedTemplateExpression(
                  tag,
                  t.templateLiteral(
                    transformedQuasi.quasis,
                    transformedExpressions,
                  ),
                );

                return t.objectProperty(key, final);
              },
            );

            useStyleIndex += 1;
          },
        });
      },
    },
  };
}

export default collectionPlugin;
