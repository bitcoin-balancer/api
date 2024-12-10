import { getBigNumber, processValue } from 'bignumber-utils';
import { ENVIRONMENT } from '../../shared/environment/index.js';
import { ISplitStates, IState } from '../../market-state/shared/types.js';
import { IBalances } from '../../shared/exchange/types.js';

/* ************************************************************************************************
 *                                         IMPLEMENTATION                                         *
 ************************************************************************************************ */

/**
 * Calculates the amount of quote asset needed in order to be able to open/increase a position. If
 * there is sufficient balance, it returns null.
 * @param increaseAmountQuote
 * @param balances
 * @returns number
 */
const calculateMissingQuoteAmount = (
  increaseAmountQuote: number,
  balances: IBalances,
): number => {
  const quoteBalance = balances[ENVIRONMENT.EXCHANGE_CONFIGURATION.quoteAsset] as number;
  if (increaseAmountQuote > quoteBalance) {
    return processValue(getBigNumber(increaseAmountQuote).minus(quoteBalance));
  }
  return 0;
};

/**
 * Calculates the percentage the current price has to change (increase or decrease) in order for
 * a strong state to be activated.
 * @param price
 * @param targetState
 * @param windowState
 * @param windowSplitStates
 * @returns number
 */
const calculateStrongWindowStateRequirement = (
  price: number,
  targetState: 2 | -2,
  windowState: IState,
  windowSplitStates: ISplitStates,
  windowStrongRequirement: number,
): number | null => null;





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  calculateMissingQuoteAmount,
  calculateStrongWindowStateRequirement,
};
