import seek from './seek';

it('early returns with the reported value when found', () => {
  let i = 0;
  const reportedValue = seek((report) => {
    for (i = 0; i < 10; i += 1) {
      if (i === 5) {
        report(i);
      }
    }
  });

  expect(reportedValue).toBe(5);
  expect(i).toBe(5);
});
