

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


/**
 * Converts a number of hours into minutes.
 * @param seconds
 * @returns number
 */
const fromHoursToMinutes = (hours: number) => Math.round(hours * 60);




/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  // time converters
  toSeconds,
  toMilliseconds,
  fromHoursToMinutes,
};
