import { ICompactLiquidityState, ILiquidityConfig } from './types.js';

/* ************************************************************************************************
 *                                         IMPLEMENTATION                                         *
 ************************************************************************************************ */

/**
 * Builds the pristine state object for the module.
 * @returns ICompactLiquidityState
 */
const buildPristineState = (): ICompactLiquidityState => ({ bidDominance: 50 });

/**
 * Builds the default module's configuration object.
 * @returns ILiquidityConfig
 */
const buildDefaultConfig = (): ILiquidityConfig => ({
  maxDistanceFromPrice: 0.35,
  intensityWeights: {
    1: 1,
    2: 3,
    3: 6,
    4: 12,
  },
});





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  buildPristineState,
  buildDefaultConfig,
};
