import { encodeError } from 'error-message-utils';
import { ISortDirection } from './types.js';

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
 *                                       SORTING UTILITIES                                        *
 ************************************************************************************************ */

/**
 * Orders two string values based on a sorting direction.
 * @param a
 * @param b
 * @param direction
 * @returns number
 */
const __sortStringValues = (a: string, b: string, direction: ISortDirection): number => {
  const _a = a.toLocaleLowerCase();
  const _b = b.toLocaleLowerCase();
  if (_a > _b) {
    return direction === 'asc' ? 1 : -1;
  }
  if (_b > _a) {
    return direction === 'asc' ? -1 : 1;
  }
  return 0;
};

/**
 * Orders two number values based on a sorting direction.
 * @param a
 * @param b
 * @param direction
 * @returns number
 */
const __sortNumberValues = (a: number, b: number, direction: ISortDirection): number => (
  direction === 'asc' ? a - b : b - a
);

/**
 * Sorts a list of values based on their type and a sort direction.
 * @param direction
 * @returns <T extends string | number>(a: T, b: T): number
 */
const sortValuesFunc = (
  direction: ISortDirection,
) => <T extends string | number>(a: T, b: T): number => {
  if (typeof a === 'string' && typeof b === 'string') {
    return __sortStringValues(a, b, direction);
  }
  if (typeof a === 'number' && typeof b === 'number') {
    return __sortNumberValues(a, b, direction);
  }
  throw new Error(encodeError(`Unable to sort list of values as they can only be string | number and must not be mixed. Received: ${typeof a}, ${typeof b}`, 1));
};




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





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  // time converters
  toSeconds,
  toMilliseconds,

  // sorting utilities
  sortValuesFunc,

  // misc helpers
  delay,
};
