import { ENVIRONMENT } from '../../shared/environment/index.js';
import { ITrade } from '../../shared/exchange/index.js';

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

/**
 * Calculates the starting point that will be used to retrieve new trades.
 * @param trades
 * @returns number
 */
const calculateSyncStartTime = (trades: ITrade[]): number => (
  trades.length > 0 ? trades[trades.length - 1].event_time + 1 : Date.now()
);





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  getSyncFrequency,
  calculateSyncStartTime,
};
