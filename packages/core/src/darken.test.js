import darken from './darken';

test('darken white', () => {
  expect(darken('white', 0.1)).toMatchInlineSnapshot(
    `"hsla(0, 0%, 90.76470588235294%, 1)"`,
  );
  expect(darken('white', 0.2)).toMatchInlineSnapshot(
    `"hsla(0, 0%, 81.35294117647058%, 1)"`,
  );
  expect(darken('white', 0.3)).toMatchInlineSnapshot(
    `"hsla(0, 0%, 71.94117647058823%, 1)"`,
  );
  expect(darken('white', 0.4)).toMatchInlineSnapshot(
    `"hsla(0, 0%, 62.52941176470588%, 1)"`,
  );
  expect(darken('white', 0.5)).toMatchInlineSnapshot(
    `"hsla(0, 0%, 53.11764705882352%, 1)"`,
  );
  expect(darken('white', 0.6)).toMatchInlineSnapshot(
    `"hsla(0, 0%, 43.70588235294118%, 1)"`,
  );
  expect(darken('white', 0.7)).toMatchInlineSnapshot(
    `"hsla(0, 0%, 33.11764705882353%, 1)"`,
  );
  expect(darken('white', 0.8)).toMatchInlineSnapshot(
    `"hsla(0, 0%, 21.352941176470587%, 1)"`,
  );
  expect(darken('white', 0.9)).toMatchInlineSnapshot(
    `"hsla(0, 0%, 9.588235294117647%, 1)"`,
  );
  expect(darken('white', 1)).toMatchInlineSnapshot(`"#000"`);
});

test('lighten black', () => {
  expect(darken('black', -0.1)).toMatchInlineSnapshot(
    `"hsla(0, 0%, 10.411764705882351%, 1)"`,
  );
  expect(darken('black', -0.2)).toMatchInlineSnapshot(
    `"hsla(0, 0%, 22.176470588235293%, 1)"`,
  );
  expect(darken('black', -0.3)).toMatchInlineSnapshot(
    `"hsla(0, 0%, 33.94117647058824%, 1)"`,
  );
  expect(darken('black', -0.4)).toMatchInlineSnapshot(
    `"hsla(0, 0%, 44.529411764705884%, 1)"`,
  );
  expect(darken('black', -0.5)).toMatchInlineSnapshot(
    `"hsla(0, 0%, 53.94117647058824%, 1)"`,
  );
  expect(darken('black', -0.6)).toMatchInlineSnapshot(
    `"hsla(0, 0%, 63.35294117647059%, 1)"`,
  );
  expect(darken('black', -0.7)).toMatchInlineSnapshot(
    `"hsla(0, 0%, 72.76470588235294%, 1)"`,
  );
  expect(darken('black', -0.8)).toMatchInlineSnapshot(
    `"hsla(0, 0%, 82.17647058823529%, 1)"`,
  );
  expect(darken('black', -0.9)).toMatchInlineSnapshot(
    `"hsla(0, 0%, 91.58823529411765%, 1)"`,
  );
  expect(darken('black', -1)).toMatchInlineSnapshot(`"#fff"`);
});
