

/* ************************************************************************************************
 *                                        TIME CONVERTERS                                         *
 ************************************************************************************************ */

/**
 * Converts a number of milliseconds (ms) into seconds.
 * @param ms
 * @returns number
 */
const fromMillisecondstoSeconds = (milliseconds: number): number => Math.round(milliseconds / 1000);


/**
 * Converts a number of hours into minutes.
 * @param seconds
 * @returns number
 */
const fromHoursToMinutes = (hours: number): number => Math.round(hours * 60);




/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  // time converters
  fromMillisecondstoSeconds,
  fromHoursToMinutes,
};
