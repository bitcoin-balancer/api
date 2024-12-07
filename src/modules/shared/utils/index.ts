

/* ************************************************************************************************
 *                                        TIME CONVERTERS                                         *
 ************************************************************************************************ */

/**
 * Converts a number of milliseconds (ms) into seconds.
 * @param ms
 * @returns number
 */
const toSeconds = (milliseconds: number) => Math.round(milliseconds / 1000);

/**
 * Converts a number of seconds into milliseconds (ms).
 * @param seconds
 * @returns number
 */
const toMilliseconds = (seconds: number) => Math.round(seconds * 1000);





/* ************************************************************************************************
 *                                          MISC HELPERS                                          *
 ************************************************************************************************ */

/**
 * Creates an asynchronous delay that resolves once the provided seconds have passed.
 * @param seconds
 * @returns Promise<void>
 */
const delay = (seconds: number): Promise<void> => new Promise((resolve) => {
  setTimeout(resolve, toMilliseconds(seconds));
});


/**
 * Attempts to execute an async function persistently.
 * @param func
 * @param args?
 * @param retryScheduleDuration?
 * @returns Promise<T>
 */
const invokeFuncPersistently = async <T>(
  func: (...args: any[]) => Promise<T>,
  args?: any[],
  retryScheduleDuration: number[] = [3, 5],
): Promise<T> => {
  try {
    if (args) {
      return await func(...args);
    }
    return await func();
  } catch (e) {
    if (retryScheduleDuration.length === 0) {
      throw e;
    }
    await delay(retryScheduleDuration[0]);
    return invokeFuncPersistently(func, args, retryScheduleDuration.slice(1));
  }
};





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  // time converters
  toSeconds,
  toMilliseconds,

  // misc helpers
  delay,
  invokeFuncPersistently,
};
