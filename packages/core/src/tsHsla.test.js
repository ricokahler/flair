import toHsla from './toHsla';

test('white', () => {
  expect(toHsla('white')).toMatchInlineSnapshot(`
    Array [
      0,
      0,
      1,
      1,
    ]
  `);
});

test('black', () => {
  expect(toHsla('black')).toMatchInlineSnapshot(`
    Array [
      0,
      0,
      0,
      1,
    ]
  `);
});

test('red', () => {
  expect(toHsla('red')).toMatchInlineSnapshot(`
    Array [
      0,
      1,
      0.5,
      1,
    ]
  `);
});

test('with alpha', () => {
  expect(toHsla('rgba(255, 255, 255, 0.5)')).toMatchInlineSnapshot(`
    Array [
      0,
      0,
      1,
      0.4980392156862745,
    ]
  `);
});
