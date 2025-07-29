import { ENVIRONMENT } from '../../shared/environment/index.js';

/* ************************************************************************************************
 *                                         IMPLEMENTATION                                         *
 ************************************************************************************************ */

/**
 * Retrieves the refetch frequency in seconds based on the exchange used for trading.
 * @returns number
 */
const getRefetchFrequency = (): number => {
  switch (ENVIRONMENT.EXCHANGE_CONFIGURATION.trading) {
    case 'kraken':
      return 600; // ~10 minutes
    default:
      return 300; // ~5 minutes
  }
};

/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export { getRefetchFrequency };
