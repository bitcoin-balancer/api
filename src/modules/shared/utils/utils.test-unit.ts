import { describe, beforeAll, afterAll, beforeEach, afterEach, test, expect, vi } from 'vitest';
import { delay } from './utils.js';

/* ************************************************************************************************
 *                                             TESTS                                              *
 ************************************************************************************************ */

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
