import { describe, beforeAll, afterAll, test, expect, vi } from 'vitest';
import { ISortDirection } from './types.js';
import {
  toSeconds,
  toMilliseconds,
  sortPrimitives,
  delay,
} from './index.js';

/* ************************************************************************************************
 *                                             TESTS                                              *
 ************************************************************************************************ */

describe('Time Converters', () => {
  describe('toSeconds', () => {
    test('can convert any number of milliseconds into seconds', () => {
      expect(toSeconds(1000)).toBe(1);
      expect(toSeconds(15123135451)).toBe(15123135);
      expect(toSeconds(65421484579)).toBe(65421485);
    });
  });


  describe('toMilliseconds', () => {
    test('can convert any number of seconds into milliseconds', () => {
      expect(toMilliseconds(1)).toBe(1000);
      expect(toMilliseconds(87564541)).toBe(87564541000);
      expect(toMilliseconds(875645416652)).toBe(875645416652000);
    });
  });
});





describe('Sorting Utilities', () => {
  test.each(<Array<[(number | string)[], ISortDirection, (number | string)[]]>>[
    [[], 'asc', []],

    // numeric values
    [[1, 2, 3, 4, 5], 'asc', [1, 2, 3, 4, 5]],
    [[1, 2, 3, 4, 5], 'desc', [5, 4, 3, 2, 1]],
    [[5, 4, 3, 2, 1], 'asc', [1, 2, 3, 4, 5]],
    [[5, 4, 3, 2, 1], 'desc', [5, 4, 3, 2, 1]],
    [[3, 1, 4, 2, 5], 'asc', [1, 2, 3, 4, 5]],
    [[3, 1, 4, 2, 5], 'desc', [5, 4, 3, 2, 1]],

    // string values
    [['a', 'b', 'c'], 'asc', ['a', 'b', 'c']],
    [['a', 'b', 'c'], 'desc', ['c', 'b', 'a']],
    [['Blue', 'Humpback', 'Beluga'], 'asc', ['Beluga', 'Blue', 'Humpback']],
    [['Blue', 'Humpback', 'Beluga'], 'desc', ['Humpback', 'Blue', 'Beluga']],
    [['The', 'Magnetic', 'Edward', 'Sharpe', 'Zeros', 'And'], 'asc', ['And', 'Edward', 'Magnetic', 'Sharpe', 'The', 'Zeros']],
    [['The', 'Magnetic', 'Edward', 'Sharpe', 'Zeros', 'And'], 'desc', ['Zeros', 'The', 'Sharpe', 'Magnetic', 'Edward', 'And']],
  ])('sortPrimitives(%o, %s) -> %o', (a, b, expected) => {
    const arr = a.slice();
    arr.sort(sortPrimitives(b));
    expect(arr).toStrictEqual(expected);
  });

  test.each(<Array<[(number | string)[], ISortDirection]>>[
    [[1, { foo: 'bar' }, 3, 4, 5], 'asc'],
    [[1, '2', 3, 4, 5], 'asc'],
    [[1, 2, '3', 4, '5'], 'asc'],
    [[[1], 2, 3], 'asc'],
  ])('sortPrimitives(%o, %s) -> Error: 1', (a, b) => {
    expect(() => a.sort(sortPrimitives(b))).toThrowError('1');
  });
});





describe('Misc Helpers', () => {
  describe('delay', () => {
    beforeAll(() => {
      vi.useFakeTimers();
    });

    afterAll(() => {
      vi.useRealTimers();
    });

    test('can delay the execution of a function for any number of seconds', async () => {
      const mockFn = vi.fn();
      delay(10).then(mockFn);
      expect(mockFn).not.toHaveBeenCalled();

      await vi.advanceTimersByTimeAsync(toMilliseconds(11));

      expect(mockFn).toHaveBeenCalledOnce();
    });
  });
});
