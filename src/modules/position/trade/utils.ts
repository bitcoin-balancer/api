import { ENVIRONMENT } from '../../shared/environment/index.js';

/* ************************************************************************************************
 *                                         IMPLEMENTATION                                         *
 ************************************************************************************************ */

/**
 * Retrieves the syncing frequency based on the exchange used for trading.
 * @returns number
 */
const getSyncFrequency = (): number => {
  switch (ENVIRONMENT.EXCHANGE_CONFIGURATION.trading) {
    case 'kraken':
      return 120; // ~2 minutes
    default:
      return 60; // ~1 minute
  }
};





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  getSyncFrequency,
};
