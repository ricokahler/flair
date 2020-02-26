import collect from './collect';

it('collects the static css from a file', () => {
  const exampleFilename = require.resolve('./Example');
  const exampleStaticThemeFilename = require.resolve('./exampleTheme.ts');

  const css = collect(exampleFilename, {
    themePath: exampleStaticThemeFilename,
  });

  expect(css).toMatchInlineSnapshot(`
    ".Example-541d60eb-root{height:var(--Example-541d60eb-root-0);display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;-webkit-flex-direction:column;-ms-flex-direction:column;flex-direction:column;overflow:hidden;color:var(--Example-541d60eb-root-1);}
    .Example-541d60eb-title{font-size:32px;font-weight:bold;margin:0;-webkit-flex:0 0 auto;-ms-flex:0 0 auto;flex:0 0 auto;margin-bottom:var(--Example-541d60eb-title-0);color:var(--Example-541d60eb-title-1);}@media (max-width:768px){.Example-541d60eb-title{font-size:24px;font-weight:bold;margin:0;}}
    .Example-541d60eb-body{font-size:16px;margin:0;line-height:1.5;-webkit-flex:1 1 auto;-ms-flex:1 1 auto;flex:1 1 auto;}"
  `);
});
