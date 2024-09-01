import { ENVIRONMENT } from '../../shared/environment/index.js';
import { toMilliseconds } from '../../shared/utils/index.js';
import { ICompactLiquidityState, ILiquidityConfig } from './types.js';

/* ************************************************************************************************
 *                                         STATE HELPERS                                          *
 ************************************************************************************************ */

/**
 * Builds the pristine state object for the module.
 * @returns ICompactLiquidityState
 */
const buildPristineState = (): ICompactLiquidityState => ({ bidDominance: 50 });


/* ************************************************************************************************
 *                                         CONFIG HELPERS                                         *
 ************************************************************************************************ */

/**
 * Returns the frequency at which the order book will be refetched.
 * @returns number
 */
const getOrderBookRefetchFrequency = (): number => {
  switch (ENVIRONMENT.EXCHANGE_CONFIGURATION.liquidity) {
    case 'binance':
      return toMilliseconds(10);
    case 'bitfinex':
      return toMilliseconds(10);
    case 'kraken':
      return toMilliseconds(20);
    default:
      return toMilliseconds(10);
  }
};

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
  // state helpes
  buildPristineState,

  // config helpers
  getOrderBookRefetchFrequency,
  buildDefaultConfig,
};
