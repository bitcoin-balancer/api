import { describe, test, expect } from 'vitest';
import { calculateSplitState } from './utils.js';


describe('calculateSplitState', () => {
  test.each([
    [[1, 2, 3, 4], 0.5, 1.5, { state: 2, change: 300 }],
    [[1, 1.01, 1.02, 1.07], 5, 10, { state: 1, change: 7 }],
    [[1, 1.01, 1.02, 1.03], 5, 10, { state: 0, change: 3 }],
    [[1, 0.98, 0.95, 0.92], 1.55, 7.85, { state: -2, change: -8 }],
    [[1, 0.98, 0.95, 0.97], 1.55, 7.85, { state: -1, change: -3 }],
  ])('calculateSplitState(%o, %f, %f) -> %o', (a, b, c, expected) => {
    expect(calculateSplitState(a, b, c)).toStrictEqual(expected);
  });
});
