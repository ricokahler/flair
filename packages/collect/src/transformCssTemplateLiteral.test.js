import { parse } from '@babel/core';
import { stripIndent } from 'common-tags';
import * as t from '@babel/types';
import generate from '@babel/generator';
import transformCssTemplateLiteral from './transformCssTemplateLiteral';

it('takes in a CSS template literal and wraps non-CSS property expressions in `staticVar`', () => {
  const code = stripIndent`
  \`
    padding: \${theme.space(0.75)} \${theme.space(1)};
    \${theme.fonts.h4};
    flex: 0 0 auto;
    margin-bottom: -\${theme.space(1)};
    color: \${theme.colors.brand};
    transition: background-color \${theme.durations.standard},
      border \${theme.durations.standard};
    border-bottom: -\${theme.space(1)} solid \${theme.colors.brand};
    background: \${staticVar(transparentize(0.5, 'black'))};

    \${theme.down(theme.tablet)} {
      \${theme.fonts.h5};
    }
  \``.trim();

  const file = parse(code, { filename: 'example.js' });

  const [firstStatement] = file.program.body;
  const templateLiteral = firstStatement.expression;
  expect(t.isTemplateLiteral(templateLiteral)).toBe(true);

  const result = transformCssTemplateLiteral(templateLiteral);

  const { code: outputCode } = generate(result);
  expect(outputCode).toMatchInlineSnapshot(`
    "\`
      padding: \${\`\${theme.space(0.75)} \${theme.space(1)}\`};
      \${staticVar(theme.fonts.h4)};
      flex: 0 0 auto;
      margin-bottom: \${\`-\${theme.space(1)}\`};
      color: \${\`\${theme.colors.brand}\`};
      transition: \${\`background-color \${theme.durations.standard},
        border \${theme.durations.standard}\`};
      border-bottom: \${\`-\${theme.space(1)} solid \${theme.colors.brand}\`};
      background: \${\`\${staticVar(transparentize(0.5, 'black'))}\`};

      \${staticVar(theme.down(theme.tablet))} {
        \${staticVar(theme.fonts.h5)};
      }
    \`"
  `);
});

test('non-CSS property expression first', () => {
  const code = stripIndent`\`
    \${theme.fonts.body1};
    flex: 1 1 auto;
  \``;

  const file = parse(code, { filename: 'example.js' });

  const [firstStatement] = file.program.body;
  const templateLiteral = firstStatement.expression;
  expect(t.isTemplateLiteral(templateLiteral)).toBe(true);

  const result = transformCssTemplateLiteral(templateLiteral);

  const { code: outputCode } = generate(result);
  expect(outputCode).toMatchInlineSnapshot(`
    "\`
        \${staticVar(theme.fonts.body1)};
        flex: 1 1 auto;
      \`"
  `);
});

test('multiline CSS property', () => {
  const code = stripIndent`\`
    transition: background-color \${theme.durations.standard},
      border \${theme.durations.standard};
  \``;

  const file = parse(code, { filename: 'example.js' });

  const [firstStatement] = file.program.body;
  const templateLiteral = firstStatement.expression;
  expect(t.isTemplateLiteral(templateLiteral)).toBe(true);

  const result = transformCssTemplateLiteral(templateLiteral);

  const { code: outputCode } = generate(result);
  expect(outputCode).toMatchInlineSnapshot(`
    "\`
        transition: \${\`background-color \${theme.durations.standard},
          border \${theme.durations.standard}\`};
      \`"
  `);
});

test('`!important`s should be kept in the string', () => {
  const code = stripIndent`\`
    background-color: \${theme.colors.brand} !important;
  \``;

  const file = parse(code, { filename: 'example.js' });

  const [firstStatement] = file.program.body;
  const templateLiteral = firstStatement.expression;
  expect(t.isTemplateLiteral(templateLiteral)).toBe(true);

  const result = transformCssTemplateLiteral(templateLiteral);

  const { code: outputCode } = generate(result);
  expect(outputCode).toMatchInlineSnapshot(`
    "\`
        background-color: \${\`\${theme.colors.brand} \`}!important;
      \`"
  `);
});
