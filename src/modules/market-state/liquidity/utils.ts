/* eslint-disable object-curly-newline */
import {
  adjustByPercentage,
  calculateMean,
  calculatePercentageRepresentation,
  processValue,
} from 'bignumber-utils';
import { ENVIRONMENT } from '../../shared/environment/index.js';
import {
  ICompactLiquidityState,
  ILiquiditySideID,
  ILiquidityIntensity,
  ILiquidityIntensityRequirements,
  ILiquidityPriceRange,
  ILiquidityPriceLevel,
  ILiquidityState,
  ILiquidityConfig,
  ILiquidityIntensityWeights,
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
 * Calculates the liquidity intensity requirements based on all of the existing price levels that
 * will be used to determine the intensity for each level.
 * @returns ILiquidityIntensityRequirements
 */
const calculateIntensityRequirements = (
  levels: ILiquidityPriceLevel[],
): ILiquidityIntensityRequirements => {
  // init values
  let accum: number = 0;
  let lowest: number = 0;
  let highest: number = 0;

  // iterate over each level and populate the values
  levels.forEach((level) => {
    accum += level[1];
    highest = level[1] > highest ? level[1] : highest;
    // eslint-disable-next-line no-nested-ternary
    lowest = lowest === 0 ? level[1] : level[1] < lowest ? level[1] : lowest;
  });

  // calculate the requirements
  const mean = processValue(accum / levels.length);
  const meanLow = calculateMean([mean, lowest]);
  const meanVeryHigh = calculateMean([mean, highest]);
  const meanHigh = calculateMean([mean, meanVeryHigh]);
  const meanHighAdj = calculateMean([mean, meanHigh]);
  const meanMedium = calculateMean([mean, meanHighAdj]);
  const meanMediumAdj = calculateMean([mean, meanMedium]);
  const meanLowMedium = calculateMean([meanLow, meanMediumAdj]);

  // finally, return the requirements
  return {
    low: meanLow,
    medium: meanLowMedium,
    high: meanMediumAdj,
    veryHigh: meanHighAdj,
  };
};

/**
 * Calculates the intensity of a price level based on its liquidity and the current requirements.
 * @param liquidity
 * @param requirements
 * @returns ILiquidityIntensity
 */
const __calculateIntensity = (
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

/**
 * Calculates the points accumulated by a side based on its peaks.
 * @param levels
 * @param weights
 * @returns number
 */
const __calculatePointsForSide = (
  levels: ILiquidityPriceLevel[],
  weights: ILiquidityIntensityWeights,
): number => levels.reduce(
  (previous, current) => previous + (current[2] === 0 ? 0 : weights[current[2]]),
  0,
);

/**
 * Calculates the bid dominance based on the liq. peaks present in both sides of the order book.
 * @param asks
 * @param bids
 * @param weights
 * @returns number
 */
const calculateBidDominance = (
  asks: ILiquidityPriceLevel[],
  bids: ILiquidityPriceLevel[],
  weights: ILiquidityIntensityWeights,
): number => {
  const askPoints = __calculatePointsForSide(asks, weights);
  const bidPoints = __calculatePointsForSide(bids, weights);
  return calculatePercentageRepresentation(bidPoints, (askPoints + bidPoints));
};





/* ************************************************************************************************
 *                                         STATE HELPERS                                          *
 ************************************************************************************************ */

/**
 * Builds the pristine state object for the module.
 * @returns ILiquidityState
 */
const buildPristineState = (): ILiquidityState => ({
  priceRange: { current: 0, upper: 0, lower: 0 },
  intensityRequirements: { low: 0, medium: 0, high: 0, veryHigh: 0 },
  asks: { total: 0, levels: [] },
  bids: { total: 0, levels: [] },
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
 * Returns the frequency in seconds at which the order book will be refetched.
 * @returns number
 */
const getOrderBookRefetchFrequency = (): number => {
  switch (ENVIRONMENT.EXCHANGE_CONFIGURATION.liquidity) {
    case 'binance':
      return 10;
    case 'bitfinex':
      return 10;
    case 'kraken':
      return 20;
    default:
      return 10;
  }
};

/**
 * Builds the default module's configuration object.
 * @returns ILiquidityConfig
 */
const buildDefaultConfig = (): ILiquidityConfig => ({
  maxDistanceFromPrice: 0.15,
  intensityWeights: {
    1: 1,
    2: 3,
    3: 6,
    4: 9,
  },
});





/* ************************************************************************************************
 *                                          MISC HELPERS                                          *
 ************************************************************************************************ */

/**
 * Generates the sort function to be used on price levels. Asks are ordered by price from low to
 * high while bids are ordered by price from high to low.
 * @param side
 * @returns (a: ILiquidityPriceLevel, b: ILiquidityPriceLevel): number
 */
const priceLevelSortFunc = (side: ILiquiditySideID) => (
  a: ILiquidityPriceLevel,
  b: ILiquidityPriceLevel,
): number => {
  if (side === 'asks') {
    return a[0] - b[0];
  }
  return b[0] - a[0];
};

/**
 * Verifies if an order's price is within the price range.
 * @param price
 * @param range
 * @param side
 * @returns boolean
 */
const isOrderPriceInRange = (
  price: number,
  range: ILiquidityPriceRange,
  side: ILiquiditySideID,
): boolean => (
  (side === 'asks' && price > range.current && price <= range.upper)
  || (side === 'bids' && price < range.current && price >= range.lower)
);

/**
 * Processes an individual price level by calculating its intensity based on the current
 * requirements.
 * @param level
 * @returns ILiquidityPriceLevel
 */
const processPriceLevel = (
  level: ILiquidityPriceLevel,
  requirements: ILiquidityIntensityRequirements,
): ILiquidityPriceLevel => (
  [level[0], level[1], __calculateIntensity(level[1], requirements)]
);





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  // calculators
  calculatePriceRange,
  calculateIntensityRequirements,
  calculateBidDominance,

  // state helpes
  buildPristineState,
  buildPristineCompactState,

  // config helpers
  getOrderBookRefetchFrequency,
  buildDefaultConfig,

  // misc helpers
  priceLevelSortFunc,
  isOrderPriceInRange,
  processPriceLevel,
};
