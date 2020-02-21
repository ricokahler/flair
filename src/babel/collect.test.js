import path from 'path';
import collect from './collect';

it('works', async () => {
  const exampleFilename = path.resolve(__dirname, './example.js');
  const exampleStaticThemeFilename = path.resolve(
    __dirname,
    './exampleStaticTheme.js',
  );

  const css = await collect(exampleFilename, {
    themePath: exampleStaticThemeFilename,
  });

  expect(css).toMatchInlineSnapshot(`
    ".example--32e5a416-root{color:var(--example--32e5a416-root-0);background-color:var(--example--32e5a416-root-1);}
    .example--32e5a416-title{width:50%;color:var(--example--32e5a416-title-0);}@media (max-width:374px){.example--32e5a416-title{width:100%;}}"
  `);
});
