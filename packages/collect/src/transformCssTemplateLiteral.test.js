import { parse } from '@babel/core';
import { stripIndent } from 'common-tags';
import * as t from '@babel/types';
import generate from '@babel/generator';
import stylis from 'stylis';
import requireFromString from 'require-from-string';
import prettier from 'prettier';
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
      transition: background-color \${\`\${theme.durations.standard},\`}
        border \${staticVar(theme.durations.standard)};
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

// TODO: make this fail lol
test.skip('calc functions', () => {
  const code = stripIndent`\`
    padding: \${theme.block(1)};
    \${theme.breakpoints.down(theme.breakpoints.tablet)} {
      padding: \${theme.block(1)};
    }

    width: 1024px;
    max-width: 100%;
    margin: 0 auto;
    margin-bottom: calc(50vh - \${theme.block(2)});

    & > h1 {
      \${theme.fonts.h1};

      \${theme.breakpoints.down(theme.breakpoints.tablet)} {
        \${theme.fonts.h1};
      }
    }

    & > h2 {
      \${theme.fonts.h1};

      \${theme.breakpoints.down(theme.breakpoints.tablet)} {
        \${theme.fonts.h1};
      }
    }
  \``;

  const file = parse(code, { filename: 'example.js' });

  const [firstStatement] = file.program.body;
  const templateLiteral = firstStatement.expression;
  expect(t.isTemplateLiteral(templateLiteral)).toBe(true);

  const result = transformCssTemplateLiteral(templateLiteral);

  const { code: outputCode } = generate(result);
  expect(outputCode).toMatchInlineSnapshot(`
"\`
    padding: \${\`\${theme.block(1)}\`};
    \${staticVar(theme.breakpoints.down(theme.breakpoints.tablet))} {
      padding: \${\`\${theme.block(1)}\`};
    }

    width: 1024px;
    max-width: 100%;
    margin: 0 auto;
    margin-bottom: calc(50vh - \${\`\${theme.block(2)})\`};

    & > h1 {
      \${staticVar(theme.fonts.h1)};

      \${staticVar(theme.breakpoints.down(theme.breakpoints.tablet))} {
        \${staticVar(theme.fonts.h1)};
      }
    }

    & > h2 {
      \${staticVar(theme.fonts.h1)};

      \${staticVar(theme.breakpoints.down(theme.breakpoints.tablet))} {
        \${staticVar(theme.fonts.h1)};
      }
    }
  \`"
`);

  const unprocessedCss = requireFromString(stripIndent`
    const staticVar = x => x;
    const theme = {
      block: () => '16px',
      fonts: {
        h1: 'font-weight: bold;',
      },
      breakpoints: {
        tablet: '725px',
        down: value => \`@media (max-width: \${value})\`,
      },
    };
    module.exports = ${outputCode}
  `);

  stylis.set({
    prefix: false,
  });

  const css = stylis('selector', unprocessedCss);

  const prettyCss = prettier.format(css, { parser: 'css' });

  expect(prettyCss).toMatchInlineSnapshot(`
    "selector {
      padding: 16px;
      width: 1024px;
      max-width: 100%;
      margin: 0 auto;
      margin-bottom: calc(50vh - 16px);
    }
    @media (max-width: 725px) {
      selector {
        padding: 16px;
      }
    }
    selector > h1 {
      font-weight: bold;
    }
    @media (max-width: 725px) {
      selector > h1 {
        font-weight: bold;
      }
    }
    selector > h2 {
      font-weight: bold;
    }
    @media (max-width: 725px) {
      selector > h2 {
        font-weight: bold;
      }
    }
    "
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
  expect(outputCode.includes('staticVar')).toBe(false);
});
