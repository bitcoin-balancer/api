import { getBigNumber, processValue } from 'bignumber-utils';
import { ENVIRONMENT } from '../../shared/environment/index.js';
import { ITrade } from '../../shared/exchange/index.js';
import { IManualTrade } from './types.js';

/* ************************************************************************************************
 *                                         IMPLEMENTATION                                         *
 ************************************************************************************************ */

/**
 * Retrieves the syncing frequency in seconds based on the exchange used for trading.
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
 * Calculates the quote value of a base amount based on a price.
 * @param amount
 * @param price
 * @returns number
 */
const __calculateAmountQuote = (amount: number, price: number): number => processValue(
  getBigNumber(amount).times(price),
  { roundingMode: 'ROUND_DOWN' },
);

/**
 * Converts a manual trade into a full trade object.
 * @param trade
 * @param id?
 * @returns ITrade
 */
const toTradeRecord = (trade: IManualTrade, id?: number): ITrade => ({
  id,
  id_alt: null,
  event_time: trade.event_time,
  side: trade.side,
  notes: trade.notes,
  price: trade.price,
  amount: trade.amount,
  amount_quote: __calculateAmountQuote(trade.amount, trade.price),
  comission: 0,
});





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  getSyncFrequency,
  toTradeRecord,
};
