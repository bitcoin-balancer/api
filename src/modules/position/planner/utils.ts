import { getBigNumber, processValue } from 'bignumber-utils';
import { ENVIRONMENT } from '../../shared/environment/index.js';
import { IBalances } from '../../shared/exchange/types.js';

/* ************************************************************************************************
 *                                         IMPLEMENTATION                                         *
 ************************************************************************************************ */

/**
 * Calculates the amount of quote asset needed in order to be able to open/increase a position. If
 * there is sufficient balance, it returns null.
 * @param increaseAmountQuote
 * @param balances
 * @returns number | null
 */
const calculateMissingQuoteAmount = (
  increaseAmountQuote: number,
  balances: IBalances,
): number | null => {
  const quoteBalance = balances[ENVIRONMENT.EXCHANGE_CONFIGURATION.quoteAsset] as number;
  if (increaseAmountQuote > quoteBalance) {
    return processValue(getBigNumber(increaseAmountQuote).minus(quoteBalance));
  }
  return null;
};





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  calculateMissingQuoteAmount,
};
