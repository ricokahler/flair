import { Visitor } from '@babel/traverse';
import { ObjectExpression, TemplateLiteral } from '@babel/types';

const createStyles = 'createStyles';
const packageName = 'react-style-system';

interface Params {
  types: typeof import('@babel/types');
}

interface Result {
  visitor: Visitor;
}

function range(n: number) {
  return Array.from(Array(n)).map((_, i) => i);
}

function plugin({ types }: Params): Result {
  let foundCreateStyles = false;

  function createArrayPropertyValueFromTemplateLiteral(quasi: TemplateLiteral) {
    const { expressions, quasis } = quasi;

    const cssPropertyExpressions = range(expressions.length)
      .map(i => ({
        expression: expressions[i],
        templateElement: quasis[i],
      }))
      .filter(({ templateElement }) => {
        // must end with a `:` to signify that the expression is a CSS property
        return templateElement.value.cooked.trim().endsWith(':');
      })
      .map(({ expression }) => expression);

    return types.arrayExpression(cssPropertyExpressions);
  }

  return {
    visitor: {
      ImportDeclaration(path) {
        const { specifiers, source } = path.node;
        const hasCreateStyles = specifiers.some(node => {
          if (!types.isImportSpecifier(node)) return false;
          return node.imported.name === createStyles;
        });
        if (!hasCreateStyles) return;

        const hasPackageName = source.value === packageName;
        if (!hasPackageName) return;

        foundCreateStyles = true;
      },

      CallExpression(path) {
        if (!foundCreateStyles) return;

        const { callee, arguments: expressionArguments } = path.node;
        if (!types.isIdentifier(callee)) return;
        if (callee.name !== createStyles) return;

        const [firstArgument] = expressionArguments;

        if (
          !types.isFunctionExpression(firstArgument) &&
          !types.isArrowFunctionExpression(firstArgument)
        ) {
          return;
        }

        const { body } = firstArgument;

        let stylesObjectExpression: ObjectExpression;
        if (types.isObjectExpression(body)) {
          stylesObjectExpression = body;
        } else {
          path.traverse({
            ReturnStatement(path) {
              const { argument } = path.node;

              if (!types.isObjectExpression(argument)) return;
              stylesObjectExpression = argument;
            },
          });
        }

        for (const property of stylesObjectExpression.properties) {
          if (!types.isObjectProperty(property)) return;
          const { value } = property;

          if (!types.isTaggedTemplateExpression(value)) return;
          const { tag, quasi } = value;

          if (!types.isIdentifier(tag)) return;
          if (tag.name !== 'css') return;

          const arrayExpression = createArrayPropertyValueFromTemplateLiteral(
            quasi,
          );

          property.value = arrayExpression;
        }
      },
    },
  };
}

export default plugin;
