import { WHITELISTED_SYMBOLS } from './data.js';
import { ICoinsConfig, ICoinsStates } from './types.js';

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
 * Builds the pristine state object for coins in both assets.
 * @returns ICoinsStates
 */
const buildPristineCoinsStates = (): ICoinsStates => ({
  quote: { state: 0, statesBySymbol: {} },
  base: { state: 0, statesBySymbol: {} },
});





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  buildDefaultConfig,
  buildPristineCoinsStates,
};
