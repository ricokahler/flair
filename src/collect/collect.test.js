import collect from './collect';

it('works', async () => {
  const exampleFilename = require.resolve('src/examples/Example');
  const exampleStaticThemeFilename = require.resolve(
    'src/examples/exampleStaticTheme',
  );

  const css = collect(exampleFilename, {
    themePath: exampleStaticThemeFilename,
  });

  expect(css).toMatchInlineSnapshot(`
    ".Example--d89a965-root{color:var(--Example--d89a965-root-0);background-color:var(--Example--d89a965-root-1);}
    .Example--d89a965-title{width:50%;color:var(--Example--d89a965-title-0);}@media (max-width:374px){.Example--d89a965-title{width:100%;}}"
  `);
});
