import { setTimeout } from 'node:timers';

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
 * Converts a number of seconds into milliseconds.
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





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  // time converters
  toSeconds,
  toMilliseconds,

  // misc helpers
  delay,
};
