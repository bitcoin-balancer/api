import { IRange } from '../../shared/types.js';
import { IStrategy } from './types.js';

/* ************************************************************************************************
 *                                           CONSTANTS                                            *
 ************************************************************************************************ */

// the range sizes that will be used to calculate the min. position amount lower and upper bands
const __MIN_POSITION_AMOUNT_RANGE_SIZE: IRange = {
  min: 0.15,
  max: 0.65,
};





/* ************************************************************************************************
 *                                         IMPLEMENTATION                                         *
 ************************************************************************************************ */

/**
 * Builds the default configuration object for the Strategy Module.
 * @returns IStrategy
 */
const buildDefaultConfig = (): IStrategy => ({
  canIncrease: true,
  canDecrease: true,
  minPositionAmountQuote: 30,
  increaseAmountQuote: 100,
  increaseIdleDuration: 72,
  increaseGainRequirement: -3,
  decreaseLevels: [
    { gainRequirement: 0.50, percentage: 5.00, frequency: 240 },
    { gainRequirement: 1.50, percentage: 10.00, frequency: 120 },
    { gainRequirement: 2.50, percentage: 17.50, frequency: 80 },
    { gainRequirement: 3.50, percentage: 25.00, frequency: 30 },
    { gainRequirement: 5.00, percentage: 35.00, frequency: 10 },
  ],
});

/**
 * Calculates the amount range that can be used to set the min position amount in the quote asset.
 * @param increaseAmountQuote
 * @returns IRange
 */
const calculateMinPositionAmountQuoteRange = (
  increaseAmountQuote: number,
): IRange => ({
  min: Math.floor(increaseAmountQuote * __MIN_POSITION_AMOUNT_RANGE_SIZE.min),
  max: Math.floor(increaseAmountQuote * __MIN_POSITION_AMOUNT_RANGE_SIZE.max),
});





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  buildDefaultConfig,
  calculateMinPositionAmountQuoteRange,
};
