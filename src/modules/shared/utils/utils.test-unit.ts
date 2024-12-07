import { describe, afterEach, test, expect, vi } from 'vitest';
import {
  toSeconds,
  toMilliseconds,
  delay,
  invokeFuncPersistently,
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





describe('Misc Helpers', () => {
  describe('delay', () => {
    afterEach(() => {
      vi.useRealTimers();
    });

    test('can delay the execution of a function for any number of seconds', async () => {
      vi.useFakeTimers();
      const mockFn = vi.fn();
      delay(10).then(mockFn);
      expect(mockFn).not.toHaveBeenCalled();

      await vi.advanceTimersByTimeAsync(toMilliseconds(11));

      expect(mockFn).toHaveBeenCalledOnce();
    });

    test('can invoke a function persistently until its out of attempts', async () => {
      const fn = vi.fn().mockRejectedValue(new Error('This is an error!'));
      await expect(invokeFuncPersistently(fn, undefined, [0, 0])).rejects.toThrowError('This is an error!');
      expect(fn).toHaveBeenNthCalledWith(1);
      expect(fn).toHaveBeenNthCalledWith(2);
      expect(fn).toHaveBeenNthCalledWith(3);
    });

    test('can invoke a function persistently until its out of attempts with args', async () => {
      const fn = vi.fn().mockRejectedValue(new Error('This is an error!'));
      const args = ['abc', 1, true, [1, 2], { foo: 'bar' }];
      await expect(invokeFuncPersistently(fn, args, [0, 0, 0])).rejects.toThrowError('This is an error!');
      expect(fn).toHaveBeenNthCalledWith(1, ...args);
      expect(fn).toHaveBeenNthCalledWith(2, ...args);
      expect(fn).toHaveBeenNthCalledWith(3, ...args);
      expect(fn).toHaveBeenNthCalledWith(4, ...args);
    });

    test('can invoke a function persistently until it resolves', async () => {
      const fn = vi
        .fn()
        .mockRejectedValueOnce(new Error('This is an error!'))
        .mockRejectedValueOnce(new Error('This is an error!'))
        .mockResolvedValueOnce(undefined);
      await expect(invokeFuncPersistently(fn, undefined, [0, 0])).resolves.toBeUndefined();
      expect(fn).toHaveBeenNthCalledWith(1);
      expect(fn).toHaveBeenNthCalledWith(2);
      expect(fn).toHaveBeenNthCalledWith(3);
    });

    test('can invoke a function persistently until it resolves a value', async () => {
      const fn = vi
        .fn()
        .mockRejectedValueOnce(new Error('This is an error!'))
        .mockResolvedValueOnce('Hello World!');
      await expect(invokeFuncPersistently(fn, undefined, [0, 0])).resolves.toBe('Hello World!');
      expect(fn).toHaveBeenNthCalledWith(1);
      expect(fn).toHaveBeenNthCalledWith(2);
    });

    test('can invoke a function persistently until it resolves with args', async () => {
      const fn = vi
        .fn()
        .mockRejectedValueOnce(new Error('This is an error!'))
        .mockRejectedValueOnce(new Error('This is an error!'))
        .mockResolvedValueOnce(undefined);
      const args = ['abc', 1, true, [1, 2], { foo: 'bar' }];
      await expect(invokeFuncPersistently(fn, args, [0, 0])).resolves.toBeUndefined();
      expect(fn).toHaveBeenNthCalledWith(1, ...args);
      expect(fn).toHaveBeenNthCalledWith(2, ...args);
      expect(fn).toHaveBeenNthCalledWith(3, ...args);
    });
  });
});
