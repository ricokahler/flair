import collect from './collect';

it('works', async () => {
  const exampleFilename = require.resolve('src/common/Example');
  const exampleStaticThemeFilename = require.resolve(
    'src/common/exampleStaticTheme',
  );

  const css = await collect(exampleFilename, {
    themePath: exampleStaticThemeFilename,
  });

  expect(css).toMatchInlineSnapshot(`
    ".Example--1e3a2647-root{color:var(--Example--1e3a2647-root-0);background-color:var(--Example--1e3a2647-root-1);}
    .Example--1e3a2647-title{width:50%;color:var(--Example--1e3a2647-title-0);}@media (max-width:374px){.Example--1e3a2647-title{width:100%;}}"
  `);
});
