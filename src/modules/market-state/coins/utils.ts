import { calculateExchange } from 'bignumber-utils';
import { ENVIRONMENT } from '../../shared/environment/index.js';
import { ISplitStates } from '../shared/types.js';
import { WHITELISTED_SYMBOLS } from './data.js';
import {
  ICoinsConfig,
  ICoinState,
  ICoinsState,
  ICompactCoinState,
  ICoinsStates,
  ISemiCompactCoinState,
} from './types.js';

/* ************************************************************************************************
 *                                         IMPLEMENTATION                                         *
 ************************************************************************************************ */

/**
 * Verifies if a symbol belongs to the base asset (Bitcoin).
 * @param symbol
 * @returns boolean
 */
const isBaseAsset = (symbol: string): boolean => (
  symbol === ENVIRONMENT.EXCHANGE_CONFIGURATION.baseAsset
);

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
 * Builds the pristine state object for the split states.
 * @returns ISplitStates
 */
const buildPristineSplitStates = (): ISplitStates => ({
  s100: { state: 0, change: 0 },
  s75: { state: 0, change: 0 },
  s50: { state: 0, change: 0 },
  s25: { state: 0, change: 0 },
  s15: { state: 0, change: 0 },
  s10: { state: 0, change: 0 },
  s5: { state: 0, change: 0 },
  s2: { state: 0, change: 0 },
});

/**
 * Builds the pristine state object for a single symbol.
 * @returns ICoinState
 */
const buildPristineCoinState = (): ICoinState => ({
  state: 0,
  splitStates: buildPristineSplitStates(),
  window: [],
});

/**
 * Builds the pristine state object based on the top symbols.
 * @param topSymbols
 * @returns ICoinsState
 */
const buildPristineCoinsState = (topSymbols: string[]): ICoinsState<ICoinState> => ({
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
const buildPristineCoinsStates = (): ICoinsStates<ICompactCoinState> => ({
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

/**
 * Converts a state object into the semi-compact variant.
 * @param state
 * @returns ICoinsState<ISemiCompactCoinState>
 */
const toSemiCompact = (state: ICoinsState<ICoinState>): ICoinsState<ISemiCompactCoinState> => ({
  state: state.state,
  statesBySymbol: Object.keys(state.statesBySymbol).reduce(
    (previous, current) => ({
      ...previous,
      [current]: {
        state: state.statesBySymbol[current].state,
        splitStates: state.statesBySymbol[current].splitStates,
      },
    }),
    {},
  ),
});



/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  isBaseAsset,
  buildDefaultConfig,
  buildPristineSplitStates,
  buildPristineCoinsState,
  buildPristineCoinsStates,
  calculateSymbolPriceInBaseAsset,
  isIntervalActive,
  toSemiCompact,
};
