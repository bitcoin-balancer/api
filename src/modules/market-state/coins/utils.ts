import { calculateExchange } from 'bignumber-utils';
import { WHITELISTED_SYMBOLS } from './data.js';
import {
  ICoinsConfig,
  ICompactCoinsStates,
  ICoinState,
  ICoinsState,
} from './types.js';

/* ************************************************************************************************
 *                                         IMPLEMENTATION                                         *
 ************************************************************************************************ */

/**
 * Builds the default configuration object.
 * @returns ICoinsConfig
 */
const buildDefaultConfig = (): ICoinsConfig => ({
  size: 128,
  interval: 15,
  requirement: 0.01,
  strongRequirement: 0.3,
  limit: 24,
  whitelistedSymbols: WHITELISTED_SYMBOLS,
});

/**
 * Builds the pristine state object for a single symbol.
 * @returns ICoinState
 */
const buildPristineCoinState = (): ICoinState => ({
  state: 0,
  splitStates: {
    s100: { state: 0, change: 0 },
    s75: { state: 0, change: 0 },
    s50: { state: 0, change: 0 },
    s25: { state: 0, change: 0 },
    s15: { state: 0, change: 0 },
    s10: { state: 0, change: 0 },
    s5: { state: 0, change: 0 },
    s2: { state: 0, change: 0 },
  },
  window: [],
});

/**
 * Builds the pristine state object based on the top symbols.
 * @param topSymbols
 * @returns ICoinsState
 */
const buildPristineCoinsState = (topSymbols: string[]): ICoinsState => ({
  state: 0,
  statesBySymbol: topSymbols.reduce(
    (previous, current) => ({ ...previous, [current]: buildPristineCoinState() }),
    {},
  ),
});

/**
 * Builds the pristine state object for coins in both assets.
 * @returns ICompactCoinsStates
 */
const buildPristineCoinsStates = (): ICompactCoinsStates => ({
  quote: { state: 0, statesBySymbol: { BTC: { state: 0 }, ETH: { state: 0 }, XRP: { state: 0 } } },
  base: { state: 0, statesBySymbol: { ETH: { state: 0 }, XRP: { state: 0 } } },
});

/**
 * Calculates the price of a symbol in base asset. For example, say BTC is worth $63,666 while ETH
 * is worth $2,728. The ETH price in base asset would be ~0.042848616 BTC.
 * @param assetPrice
 * @param baseAssetPrice
 * @param decimalPlaces
 * @returns number
 */
const calculateSymbolPriceInBaseAsset = (
  assetPrice: number,
  baseAssetPrice: number,
  decimalPlaces: number,
): number => calculateExchange(assetPrice, baseAssetPrice, { decimalPlaces });

/**
 * Verifies if the interval for a window item is still active.
 * @param startTime
 * @param duration
 * @param currentTime
 * @returns boolean
 */
const isIntervalActive = (startTime: number, duration: number, currentTime: number): boolean => (
  typeof startTime === 'number' && (startTime + (duration * 1000)) < currentTime
);





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  buildDefaultConfig,
  buildPristineCoinsState,
  buildPristineCoinsStates,
  calculateSymbolPriceInBaseAsset,
  isIntervalActive,
};
