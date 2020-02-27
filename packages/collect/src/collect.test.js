import collect from './collect';

it('collects the static css from a file', () => {
  const exampleFilename = require.resolve('./Example');
  const exampleStaticThemeFilename = require.resolve('./exampleTheme.ts');

  const css = collect(exampleFilename, {
    themePath: exampleStaticThemeFilename,
  });

  expect(css).toMatchInlineSnapshot(`
    ".Example--7d97114e-root{height:var(--Example--7d97114e-root-0);display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;-webkit-flex-direction:column;-ms-flex-direction:column;flex-direction:column;overflow:hidden;color:var(--Example--7d97114e-root-1);}
    .Example--7d97114e-title{font-size:32px;font-weight:bold;margin:0;-webkit-flex:0 0 auto;-ms-flex:0 0 auto;flex:0 0 auto;margin-bottom:var(--Example--7d97114e-title-0);color:var(--Example--7d97114e-title-1);}@media (max-width:768px){.Example--7d97114e-title{font-size:24px;font-weight:bold;margin:0;}}
    .Example--7d97114e-body{font-size:16px;margin:0;line-height:1.5;-webkit-flex:1 1 auto;-ms-flex:1 1 auto;flex:1 1 auto;}"
  `);
});
