import { ENVIRONMENT } from '../../shared/environment/index.js';

/* ************************************************************************************************
 *                                         IMPLEMENTATION                                         *
 ************************************************************************************************ */

/**
 * Retrieves the refetch frequency based on the exchange used for trading.
 * @returns number
 */
const getRefetchFrequency = (): number => {
  switch (ENVIRONMENT.EXCHANGE_CONFIGURATION.trading) {
    case 'kraken':
      return 300; // ~5 minutes
    default:
      return 180; // ~3 minutes
  }
};





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  getRefetchFrequency,
};
