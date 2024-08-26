import { describe, test, expect } from 'vitest';
import { IState, IStateResult } from './types.js';
import { calculateSplitState, calculateStateForSeries, calculateStateMean } from './utils.js';

/* ************************************************************************************************
 *                                           CONSTANTS                                            *
 ************************************************************************************************ */

// fake list of numbers for state calculations
const SERIES: number[] = [
  7, 73, 24, 37, 41, 66, 109, 45, 120, 84, 2, 102, 97, 86, 94, 105, 74, 77, 64, 14, 62, 6, 124, 56,
  29, 81, 89, 22, 65, 17, 4, 48, 87, 119, 12, 51, 23, 39, 112, 93, 69, 98, 54, 8, 43, 78, 31, 1,
  34, 104, 13, 38, 71, 25, 11, 68, 40, 88, 52, 122, 3, 80, 58, 92, 20, 106, 15, 60, 46, 53, 91, 10,
  79, 82, 35, 27, 21, 42, 108, 101, 16, 126, 85, 75, 76, 5, 110, 30, 70, 61, 99, 125, 28, 55, 19,
  95, 18, 113, 117, 47, 2, 58, 121, 105, 81, 18, 34, 69, 75, 65, 4, 74, 24, 123, 8, 53, 9, 116,
  120, 97, 115, 13, 400, 71, 25, 11, 68, 40,
];

// fake stat result based on the values in SERIES
const STATE_RESULT: IStateResult = {
  mean: 1,
  splits: {
    s100: { state: 2, change: 471.43 },
    s75: { state: -1, change: -54.02 },
    s50: { state: 2, change: 100 },
    s25: { state: 2, change: 122.22 },
    s15: { state: -1, change: -46.67 },
    s10: { state: 0, change: -24.53 },
    s5: { state: 2, change: 207.69 },
    s2: { state: 2, change: 263.64 },
  },
};





/* ************************************************************************************************
 *                                             TESTS                                              *
 ************************************************************************************************ */
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





describe('calculateStateMean', () => {
  test.each<[IState[], IState]>([
    [[2, 2, 2, 2, 2, 2, 2, 2], 2],
    [[2, 2, 1, 0, -1, 2, 2, 2], 1],
    [[2, 1, 1, 0, -1, 0, 0, -2], 0],
    [[-2, -1, 1, 0, -1, 1, -2, -2], -1],
    [[-2, -2, -1, -1, -2, 0, -2, -2], -2],
  ])('calculateSplitState(%o) -> %i', (a, expected) => {
    expect(calculateStateMean(a)).toStrictEqual(expected);
  });
});





describe('calculateStateForSeries', () => {
  test('can calculate the state of a list of numeric values', () => {
    expect(calculateStateForSeries(SERIES, 40, 55)).toStrictEqual(STATE_RESULT);
  });

  test('can calculate the state of a list of split state items', () => {
    expect(
      calculateStateForSeries(
        SERIES.map((value, i) => ({ x: Date.now() + (i * 60000), y: value })),
        40,
        55,
      ),
    ).toStrictEqual(STATE_RESULT);
  });
});
