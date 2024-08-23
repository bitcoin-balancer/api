import { WHITELISTED_SYMBOLS } from './data.js';
import { ICoinsConfig } from './types.js';

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
  whitelistedSymbols: WHITELISTED_SYMBOLS,
});





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  buildDefaultConfig,
};
