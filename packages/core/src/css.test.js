import css from './css';

it('just re-exports the string its given', () => {
  expect(css`.thing {}`).toBe('.thing {}');
});
