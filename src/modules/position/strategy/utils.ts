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
  increaseAmountQuote: 100,
  increaseGainRequirement: -3,
  increaseIdleDuration: 48,
  increaseIdleMode: 'incremental',
  decreaseLevels: [
    { gainRequirement: 0.50, percentage: 5.00, frequency: 240 },
    { gainRequirement: 1.50, percentage: 10.00, frequency: 120 },
    { gainRequirement: 2.50, percentage: 17.50, frequency: 80 },
    { gainRequirement: 3.50, percentage: 25.00, frequency: 30 },
    { gainRequirement: 5.00, percentage: 35.00, frequency: 10 },
  ],
});





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  buildDefaultConfig,
};
