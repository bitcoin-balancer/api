import {
  getBigNumber,
  processValue,
  calculatePercentageChange,
  IBigNumber,
} from 'bignumber-utils';
import { IMarketState } from '../market-state/index.js';
import { IMarketStateDependantProps } from './types.js';

/* ************************************************************************************************
 *                                          CALCULATORS                                           *
 ************************************************************************************************ */

/**
 * Calculates the quote value of a base asset amount for a price.
 */
const __calculateQuoteAmount = (amount: number, price: number): IBigNumber => processValue(
  getBigNumber(amount).times(price),
  { type: 'bignumber', roundingMode: 'ROUND_HALF_DOWN', decimalPlaces: 2 },
);

/**
 * Calculates all the position props that are affected when the market state changes.
 * @param marketPrice
 * @param entryPrice
 * @param amount
 * @param amountQuoteIn
 * @param amountQuoteOut
 * @returns IMarketStateDependantProps
 */
const calculateMarketStateDependantProps = (
  marketPrice: number,
  entryPrice: number,
  amount: number,
  amountQuoteIn: number,
  amountQuoteOut: number,
): IMarketStateDependantProps => {
  // calculate the amount in quote asset
  const amountQuote = __calculateQuoteAmount(amount, marketPrice);
  const unrealizedAmountQuoteOut = amountQuote.plus(amountQuoteOut);

  // finally, pack and return the results
  return {
    gain: calculatePercentageChange(entryPrice, marketPrice),
    amount_quote: processValue(amountQuote),
    pnl: processValue(unrealizedAmountQuoteOut.minus(amountQuoteIn)),
    roi: calculatePercentageChange(amountQuoteIn, unrealizedAmountQuoteOut),
  };
};





/* ************************************************************************************************
 *                                     EVENT HANDLING HELPERS                                     *
 ************************************************************************************************ */

/**
 * Checks if a reversal event has just been issued in the current market state.
 * @param lastReversal
 * @param state
 * @returns boolean
 */
const newReversalEventIssued = (lastReversal: number, state: IMarketState): boolean => (
  state.reversalState !== undefined
  && typeof state.reversalState.reversalEventTime === 'number'
  && state.reversalState.reversalEventTime > lastReversal
);





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  // calculators
  calculateMarketStateDependantProps,

  // event handling helpers
  newReversalEventIssued,
};
