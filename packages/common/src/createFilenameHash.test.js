import createFilenameHash from './createFilenameHash';

it('creates a hash for a file name keeping the base', () => {
  expect(createFilenameHash('/some/path/Component.js')).toMatchInlineSnapshot(
    `"Component-509eac38"`,
  );
});
