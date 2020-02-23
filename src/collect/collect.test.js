import collect from './collect';
require("@babel/register");

it('collects the static css from a file', () => {
  const exampleFilename = require.resolve('../examples/Example');
  const exampleStaticThemeFilename = require.resolve(
    '../examples/exampleStaticTheme',
  );

  const css = collect(exampleFilename, {
    themePath: exampleStaticThemeFilename,
  });

  expect(css).toMatchInlineSnapshot(`
    ".Example--d89a965-root{color:var(--Example--d89a965-root-0);background-color:var(--Example--d89a965-root-1);}
    .Example--d89a965-title{width:50%;color:var(--Example--d89a965-title-0);}@media (max-width:374px){.Example--d89a965-title{width:100%;}}"
  `);
});

it('works with other import names', () => {
  const buttonFilename = require.resolve('../examples/Button');
  const staticThemeFilename = require.resolve('../examples/exampleStaticTheme');

  const css = collect(buttonFilename, {
    themePath: staticThemeFilename,
    importSourceValue: 'hacker-ui',
  });

  expect(css).toMatchInlineSnapshot(`
    ".Button-c5bcd77-root{background-color:var(--Button-c5bcd77-root-0);color:var(--Button-c5bcd77-root-1);}
    .Button-c5bcd77-thing{color:var(--Button-c5bcd77-thing-0);font-weight:bold;}"
  `);
});
