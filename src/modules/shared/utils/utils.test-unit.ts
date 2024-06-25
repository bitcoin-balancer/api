import { describe, beforeAll, afterAll, beforeEach, afterEach, test, expect, vi } from 'vitest';
import { toSeconds, toMilliseconds, delay } from './utils.js';

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




describe('Misc Helpers', () => {
  describe('delay', () => {
    beforeAll(() => {
      vi.useFakeTimers();
    });

    afterAll(() => {
      vi.useRealTimers();
    });

    beforeEach(() => { });

    afterEach(() => { });

    test('can delay the execution of a function for any number of seconds', async () => {
      const mockFn = vi.fn();
      delay(10).then(mockFn);
      expect(mockFn).not.toHaveBeenCalled();

      await vi.advanceTimersByTimeAsync(11 * 1000);

      expect(mockFn).toHaveBeenCalledOnce();
    });
  });
});
