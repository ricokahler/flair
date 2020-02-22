import { Visitor } from '@babel/traverse';
import * as t from '@babel/types';
import createFileNameHash from 'src/common/createFileNameHash';

interface Result {
  visitor: Visitor;
}

function range(n: number) {
  return Array.from(Array(n)).map((_, i) => i);
}

function plugin(): Result {
  let foundCreateStyles = false;

  function createArrayPropertyValueFromTemplateLiteral(
    quasi: t.TemplateLiteral,
  ) {
    const { expressions, quasis } = quasi;

    const cssPropertyExpressions = range(expressions.length)
      .map(i => ({
        expression: expressions[i],
        templateElement: quasis[i],
      }))
      .filter(({ templateElement }) => {
        // must end with a `:` to signify that the expression is a CSS property
        return templateElement.value.raw.trim().endsWith(':');
      })
      .map(({ expression }) => expression);

    return t.arrayExpression(cssPropertyExpressions);
  }

  return {
    visitor: {
      ImportDeclaration(path, state: any) {
        const {
          importSourceValue = 'react-style-system',
          importedName = 'createStyles',
        } = state.opts;

        const { specifiers, source } = path.node;
        const hasCreateStyles = specifiers.some(node => {
          if (!t.isImportSpecifier(node)) return false;
          return node.imported.name === importedName;
        });
        if (!hasCreateStyles) return;

        const hasPackageName = source.value === importSourceValue;
        if (!hasPackageName) return;

        foundCreateStyles = true;
      },

      CallExpression(path, state: any) {
        const { opts, filename } = state;
        const { importedName = 'createStyles' } = opts;

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
          const { value } = property;

          if (!t.isTaggedTemplateExpression(value)) return;
          const { tag, quasi } = value;

          if (!t.isIdentifier(tag)) return;
          if (tag.name !== 'css') return;

          const arrayExpression = createArrayPropertyValueFromTemplateLiteral(
            quasi,
          );

          property.value = arrayExpression;
        }

        stylesObjectExpression.properties.push(
          t.objectProperty(
            t.identifier('classNamePrefix'),
            t.stringLiteral(createFileNameHash(filename)),
          ),
        );
      },
    },
  };
}

export default plugin;
