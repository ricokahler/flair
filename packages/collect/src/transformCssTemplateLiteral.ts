import * as t from '@babel/types';
import requireFromString from 'require-from-string';
import generate from '@babel/generator';

const errorMessage =
  'This is a bug in react-style-system. Please open an issue.';

function parsePre(pre: string, expressions: t.Expression[]) {
  const preExpressionMatches = Array.from(pre.matchAll(/xX__\d+__Xx/g));
  const preLocations = preExpressionMatches.map(expressionMatch => {
    const start = expressionMatch.index!;
    const end = expressionMatch.index! + expressionMatch[0].length;

    return { start, end };
  });

  const preTuples = preLocations.map(({ start, end }, i) => {
    const previous = preLocations[i - 1];
    const p = pre.substring(previous ? previous.end : 0, start);

    const templateElement = t.templateElement({ raw: p });
    const s = pre.substring(start, end);
    const m = /xX__(\d+)__Xx/.exec(s);
    if (!m) {
      throw new Error(`${errorMessage} code-2`);
    }
    const d = parseInt(m[1], 10);

    // wrap in `staticVar`
    const expression = t.callExpression(t.identifier('staticVar'), [
      expressions[d],
    ]) as t.Expression;

    return { templateElement, expression };
  });

  const lastPreLocation = preLocations[preLocations.length - 1];
  const lastPreStr = lastPreLocation ? pre.substring(lastPreLocation.end) : pre;
  const lastPreTemplateElement = t.templateElement({ raw: lastPreStr });

  return { tuples: preTuples, lastTemplateElement: lastPreTemplateElement };
}

function transformCssTemplateLiteral(templateLiteral: t.TemplateLiteral) {
  const { quasis, expressions } = templateLiteral;

  const quasiQuotesCssResult = generate(
    t.templateLiteral(
      quasis,
      Array.from(Array(expressions.length)).map((_, i) =>
        t.stringLiteral(`xX__${i}__Xx`),
      ),
    ),
  );

  const quasiQuotesCss: string = requireFromString(
    `module.exports = ${quasiQuotesCssResult.code}`,
  );
  const propertyMatches = Array.from(quasiQuotesCss.matchAll(/:[^;:]*;/g));

  const quasiQuoteLocations = propertyMatches
    // only grab the properties that are quasi quoted
    .filter(match => /xX__\d+__Xx/.test(match[0]))
    // calculate the start and end for each property match
    .map(match => {
      const property = match[0];
      const propertyMatch = /(:\s*)(.*xX__[^;:]*__Xx.*)\s*;/.exec(property);
      if (!propertyMatch) {
        throw new Error(`${errorMessage} code-1`);
      }
      const matchIndex = propertyMatch[1].length;
      const start = match.index! + matchIndex;
      const end = start + propertyMatch[2].length; // minus 1 to remove semi

      return { start, end };
    });

  const quasiQuoteParts = quasiQuoteLocations.map(({ start, end }, i) => {
    const previous = quasiQuoteLocations[i - 1];

    /**
     * `pre` is the non-quasi-quoted string before a quasi-quoted string
     */
    const pre = quasiQuotesCss.substring(previous ? previous.end : 0, start);
    const str = quasiQuotesCss.substring(start, end);

    return { pre, str };
  });

  const lastLocation = quasiQuoteLocations[quasiQuoteLocations.length - 1];
  if (!lastLocation) {
    const parsed = parsePre(quasiQuotesCss, expressions);
    return t.templateLiteral(
      [
        ...parsed.tuples.map(t => t.templateElement),
        parsed.lastTemplateElement,
      ],
      parsed.tuples.map(t => t.expression),
    );
  }
  const lastPart = quasiQuotesCss.substring(lastLocation.end);

  const tuples = quasiQuoteParts
    .map(({ pre, str }) => {
      const { tuples, lastTemplateElement } = parsePre(pre, expressions);

      // str processing
      const matches = Array.from(str.matchAll(/xX__(\d+)__Xx/g));

      const strParts = matches.map((match, i) => {
        const previous = matches[i - 1];
        const previousEnd = previous ? previous.index! + previous[0].length : 0;
        const d = parseInt(match[1], 10);
        const pre = str.substring(previousEnd, match.index!);
        const expression = expressions[d];

        return { pre, expression };
      });
      const lastMatch = matches[matches.length - 1];
      if (!lastMatch) {
        throw new Error(`${errorMessage} code-3`);
      }
      const lastIdk = str.substring(lastMatch.index! + lastMatch[0].length);

      const pres = [...strParts.map(t => t.pre), lastIdk];
      const exps = strParts.map(t => t.expression);

      const revisedExpression = t.templateLiteral(
        pres.map(pre => t.templateElement({ raw: pre })),
        exps,
      );

      return [
        ...tuples,
        {
          templateElement: lastTemplateElement,
          expression: revisedExpression as t.Expression,
        },
      ];
    })
    .flat();

  const last = parsePre(lastPart, expressions);

  const templateElements = [
    ...tuples.map(tuple => tuple.templateElement),
    ...last.tuples.map(tuple => tuple.templateElement),
    last.lastTemplateElement,
  ];

  const finalExpressions = [
    ...tuples.map(tuple => tuple.expression),
    ...last.tuples.map(tuple => tuple.expression),
  ];

  return t.templateLiteral(templateElements, finalExpressions);
}

export default transformCssTemplateLiteral;
