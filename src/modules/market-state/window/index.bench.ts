import { describe, bench } from 'vitest';

/* ************************************************************************************************
 *                                            HELPERS                                             *
 ************************************************************************************************ */

// generates a list of random numbers
const generateRandomArray = (
  length: number,
  min: number = 0,
  max: number = Number.POSITIVE_INFINITY,
): number[] => {
  const randomArray = [];
  for (let i = 0; i < length; i += 1) {
    randomArray.push(Math.floor(Math.random() * (max - min + 1)) + min);
  }
  return randomArray;
};




/* ************************************************************************************************
 *                                           CONSTANTS                                            *
 ************************************************************************************************ */

// the arrays that will be tested
const ARRAYS = [generateRandomArray(128), generateRandomArray(256), generateRandomArray(512)];





/* ************************************************************************************************
 *                                             TESTS                                              *
 ************************************************************************************************ */
describe('Drop Oldest Candlestick', () => {
  bench('using shift()', () => {
    ARRAYS.forEach((arr) => {
      const clone = arr.slice();
      clone.shift();
    });
  });

  bench('using slice(1)', () => {
    ARRAYS.forEach((arr) => {
      const clone = arr.slice();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const newArr = clone.slice(1);
    });
  });
});
