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
    { gainRequirement: 1.5, percentage: 5.0, frequency: 240 },
    { gainRequirement: 3.5, percentage: 10.0, frequency: 120 },
    { gainRequirement: 5.5, percentage: 17.5, frequency: 80 },
    { gainRequirement: 7.5, percentage: 25.0, frequency: 30 },
    { gainRequirement: 10.0, percentage: 35.0, frequency: 10 },
  ],
});

/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export { buildDefaultConfig };
