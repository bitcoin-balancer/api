import { IStrategy } from './types.js';

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
  // minPositionSize: 30,
  increaseAmountQuote: 100,
  increaseIdleDuration: 72,
  increaseGainRequirement: -3,
  decreaseLevels: [
    { gainRequirement: 0, percentage: 0, frequency: 0 },
    { gainRequirement: 0, percentage: 0, frequency: 0 },
    { gainRequirement: 0, percentage: 0, frequency: 0 },
    { gainRequirement: 0, percentage: 0, frequency: 0 },
    { gainRequirement: 0, percentage: 0, frequency: 0 },
  ],
});





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  buildDefaultConfig,
};
