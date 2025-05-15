const { calculateAccuracy } = require('../script');

test('calculates 80% accuracy for 8 out of 10', () => {
  expect(calculateAccuracy(8, 10)).toBe(80);
});

test('returns 0 if total is 0', () => {
  expect(calculateAccuracy(5, 0)).toBe(0);
});

test('calculates 100% accuracy for 10 out of 10', () => {
  expect(calculateAccuracy(10, 10)).toBe(100);
});
