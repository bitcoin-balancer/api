import { adjustByPercentage } from 'bignumber-utils';
import { toMilliseconds } from '../../shared/utils/index.js';
import { ENVIRONMENT } from '../../shared/environment/index.js';
import {
  ICompactLiquidityState,
  ILiquidityConfig,
  ILiquidityPriceRange,
} from './types.js';

/* ************************************************************************************************
 *                                          CALCULATORS                                           *
 ************************************************************************************************ */

/**
 * Calculates the price range used to filter orders when calculating the state.
 * @param currentPrice
 * @param maxDistanceFromPrice
 * @returns ILiquidityPriceRange
 */
const calculatePriceRange = (
  currentPrice: number,
  maxDistanceFromPrice: number,
): ILiquidityPriceRange => ({
  current: currentPrice,
  upper: adjustByPercentage(currentPrice, maxDistanceFromPrice),
  lower: adjustByPercentage(currentPrice, -(maxDistanceFromPrice)),
});





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
  // calculators
  calculatePriceRange,

  // state helpes
  buildPristineState,

  // config helpers
  getOrderBookRefetchFrequency,
  buildDefaultConfig,
};
