import {
  getBigNumber,
  processValue,
  calculatePercentageChange,
  IBigNumber,
} from 'bignumber-utils';
import { IMarketState } from '../market-state/index.js';
import { IMarketStateDependantProps, ITradesAnalysis } from './types.js';
import { ITrade } from '../shared/exchange/types.js';

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
 *                                        TRADES ANALYSIS                                         *
 ************************************************************************************************ */

/**
 * Builds the default analsysis object to serve as a skeleton.
 * @returns ITradesAnalysis
 */
const buildDefaultAnalysis = (): ITradesAnalysis => ({
  open: 0,
  close: null,
  entry_price: 0,
  amount: 0,
  amount_quote: 0,
  amount_quote_in: 0,
  amount_quote_out: 0,
  pnl: 0,
  roi: 0,
});


const analyzeTrades = (trades: ITrade[]): ITradesAnalysis | undefined => (
  trades.length > 0
    ? buildDefaultAnalysis()
    : undefined
);





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

  // trades analysis
  analyzeTrades,

  // event handling helpers
  newReversalEventIssued,
};
