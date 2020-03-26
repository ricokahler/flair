import createReadablePalette from './createReadablePalette';

test('light blue', () => {
  expect(createReadablePalette('#ccf')).toMatchInlineSnapshot(`
    Object {
      "aa": "#000",
      "aaa": "#000",
      "decorative": "#ccf",
      "original": "#ccf",
      "readable": "#000",
    }
  `);
});

test('dark blue', () => {
  expect(createReadablePalette('#00a')).toMatchInlineSnapshot(`
    Object {
      "aa": "#00a",
      "aaa": "#00a",
      "decorative": "#00a",
      "original": "#00a",
      "readable": "#00a",
    }
  `);
});

test('middle blue', () => {
  expect(createReadablePalette('#7575FF')).toMatchInlineSnapshot(`
    Object {
      "aa": "#000",
      "aaa": "#000",
      "decorative": "#7575FF",
      "original": "#7575FF",
      "readable": "#7575FF",
    }
  `);
});

test('dark mode', () => {
  expect(createReadablePalette('#eee', '#000')).toMatchInlineSnapshot(`
    Object {
      "aa": "#eee",
      "aaa": "#eee",
      "decorative": "#eee",
      "original": "#eee",
      "readable": "#eee",
    }
  `);
});
