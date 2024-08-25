import { WHITELISTED_SYMBOLS } from './data.js';
import { ICoinsConfig, ICompactCoinsStates, ICoinState } from './types.js';

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
 * Builds the pristine state object for coins in both assets.
 * @returns ICompactCoinsStates
 */
const buildPristineCoinsStates = (): ICompactCoinsStates => ({
  quote: { state: 0, statesBySymbol: { BTC: { state: 0 }, ETH: { state: 0 }, XRP: { state: 0 } } },
  base: { state: 0, statesBySymbol: { ETH: { state: 0 }, XRP: { state: 0 } } },
});





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  buildDefaultConfig,
  buildPristineCoinsStates,
};
