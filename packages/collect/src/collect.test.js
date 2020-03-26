import collect from './collect';

it('collects the static css from a file', () => {
  const exampleFilename = require.resolve('./Example');
  const exampleStaticThemeFilename = require.resolve('./exampleTheme.ts');

  const css = collect(exampleFilename, {
    themePath: exampleStaticThemeFilename,
  });

  expect(css).toMatchInlineSnapshot(`
    ".Example--00000-root{height:var(--Example--00000-root-0);display:flex;flex-direction:column;overflow:hidden;color:var(--Example--00000-root-1)}
    .Example--00000-title{font-size:32px;font-weight:bold;margin:0;flex:0 0 auto;margin-bottom:var(--Example--00000-title-0);color:var(--Example--00000-title-1);border-bottom:var(--Example--00000-title-2)}@media (max-width:768px){.Example--00000-title{font-size:24px;font-weight:bold;margin:0}}
    .Example--00000-body{font-size:16px;margin:0;line-height:1.5;flex:1 1 auto}"
  `);
});
