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
  size: 2.5,
  interval: 128,
  requirement: 0,
  strongRequirement: 0.025,
  whitelistedSymbols: WHITELISTED_SYMBOLS,
});





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  buildDefaultConfig,
};
