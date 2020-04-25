import fs from 'fs';
import _path from 'path';
import { Visitor } from '@babel/traverse';
import * as t from '@babel/types';
import {
  collect,
  transformCssTemplateLiteral,
  CollectionPluginOptions,
} from '@react-style-system/collect';
import { seek, createFilenameHash } from '@react-style-system/common';

interface Options extends CollectionPluginOptions {
  themePath: string;
  cacheDir: string;
}

const importSourceValue = 'react-style-system';
const replacementImportSourceValue = '@react-style-system/ssr';
const importedName = 'createStyles';

function plugin(
  _: any,
  opts: Options,
): {
  visitor: Visitor<{ opts: Options; file: { opts: { filename: string } } }>;
} {
  const { cacheDir } = opts;

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
        const cssFilename = _path.join(cacheDir, `${filenameHash}.css`);

        // Find create styles before continuing
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

        // Generate the CSS via `collect`
        // This generation is done up here so that this plugin can early quit
        // if `collect` throws
        const css = collect(filename, opts);

        // Add the import for the CSS filename
        path.node.body.unshift(
          t.importDeclaration([], t.stringLiteral(cssFilename)),
        );

        path.traverse({
          // Rewrite imports
          ImportDeclaration(path) {
            const { specifiers, source } = path.node;
            const hasCreateStyles = specifiers.some(node => {
              if (!t.isImportSpecifier(node)) return false;
              return node.imported.name === importedName;
            });
            if (!hasCreateStyles) return;

            const hasPackageName = source.value === importSourceValue;
            if (!hasPackageName) return;

            path.node.source = t.stringLiteral(replacementImportSourceValue);
          },

          // Rewrite `createStyles` return object expression
          CallExpression(path) {
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

            const stylesObjectExpression = seek<t.ObjectExpression>(report => {
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

                const transformedTemplateLiteral = transformCssTemplateLiteral(
                  quasi,
                );

                const cssPropertyExpressions = transformedTemplateLiteral.expressions.filter(
                  expression => {
                    if (
                      t.isCallExpression(expression) &&
                      t.isIdentifier(expression.callee) &&
                      expression.callee.name === 'staticVar'
                    ) {
                      return false;
                    }
                    return true;
                  },
                );

                return t.objectProperty(
                  key,
                  t.arrayExpression(cssPropertyExpressions),
                );
              },
            );

            stylesObjectExpression.properties.push(
              t.objectProperty(
                t.identifier('classNamePrefix'),
                t.stringLiteral(
                  `${createFilenameHash(filename)}-${useStyleIndex}`,
                ),
              ),
            );

            useStyleIndex += 1;
          },
        });

        // Tradeoff alert:
        //
        // using fs.writeFileSync allows us to write a file from a babel plugin.
        // this means we don't need any bundler integration for this thing to
        // work but it's kind of weird to see this kind of side-effect inside of
        // a babel plugin
        if (!fs.existsSync(cacheDir)) {
          fs.mkdirSync(cacheDir);
        }
        fs.writeFileSync(cssFilename, css);
      },
    },
  };
}

export default plugin;
