import { IReversalConfig } from './types.js';

/* ************************************************************************************************
 *                                          STATE HELPERS                                         *
 ************************************************************************************************ */




/* ************************************************************************************************
 *                                         CONFIG HELPERS                                         *
 ************************************************************************************************ */

/**
 * Builds the default module's configuration object.
 * @returns IReversalConfig
 */
const buildDefaultConfig = (): IReversalConfig => ({
  crashDuration: 120,
  crashIdleDuration: 60,
  pointsRequirement: 75,
  weights: {
    liquidity: 35,
    coinsQuote: 35,
    coinsBase: 30,
  },
});





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  // state helpers


  // config helpers
  buildDefaultConfig,
};
