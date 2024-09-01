import { adjustByPercentage } from 'bignumber-utils';
import { toMilliseconds } from '../../shared/utils/index.js';
import { ENVIRONMENT } from '../../shared/environment/index.js';
import {
  ICompactLiquidityState,
  ILiquidityConfig,
  ILiquidityIntensity,
  ILiquidityIntensityRequirements,
  ILiquidityPriceRange,
  ILiquidityState,
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

/**
 * Calculates the liquidity intensity requirements based on all of the existing price levels.
 * @returns ILiquidityIntensityRequirements
 */
const calculateIntensityRequirements = (): ILiquidityIntensityRequirements => ({
  low: 0,
  medium: 0,
  high: 0,
  veryHigh: 0,
});

/**
 * Calculates the intensity of a price level based on its liquidity and the current requirements.
 * @param liquidity
 * @param requirements
 * @returns ILiquidityIntensity
 */
const calculateIntensity = (
  liquidity: number,
  requirements: ILiquidityIntensityRequirements,
): ILiquidityIntensity => {
  if (liquidity >= requirements.veryHigh) {
    return 4;
  }
  if (liquidity >= requirements.high) {
    return 3;
  }
  if (liquidity >= requirements.medium) {
    return 2;
  }
  if (liquidity >= requirements.low) {
    return 1;
  }
  return 0;
};





/* ************************************************************************************************
 *                                         STATE HELPERS                                          *
 ************************************************************************************************ */

/**
 * Builds the pristine state object for the module.
 * @returns ILiquidityState
 */
const buildPristineState = (): ILiquidityState => ({
  bidDominance: 50,
  lastRefetch: Date.now(),
});

/**
 * Builds the pristine compact state object for the module.
 * @returns ICompactLiquidityState
 */
const buildPristineCompactState = (): ICompactLiquidityState => ({ bidDominance: 50 });





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
  calculateIntensityRequirements,
  calculateIntensity,

  // state helpes
  buildPristineState,
  buildPristineCompactState,

  // config helpers
  getOrderBookRefetchFrequency,
  buildDefaultConfig,
};
