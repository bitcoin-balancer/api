import {
  getBigNumber,
  processValue,
  calculatePercentageChange,
  IBigNumber,
} from 'bignumber-utils';
import { delay } from '../shared/utils/index.js';
import { IBalances, ITrade } from '../shared/exchange/index.js';
import { BalanceService } from './balance/index.js';
import { IMarketStateDependantProps, ITradesAnalysis } from './types.js';

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
 *                                           RETRIEVERS                                           *
 ************************************************************************************************ */

/**
 * Attempts to retrieve the initial balances in a very persistent manner.
 * @param retryScheduleDuration?
 * @returns Promise<IBalances>
 */
const getBalances = async (
  retryScheduleDuration: number[] = [5, 15, 30, 60, 180],
): Promise<IBalances> => {
  try {
    return await BalanceService.getBalances(true);
  } catch (e) {
    if (retryScheduleDuration.length === 0) {
      throw e;
    }
    await delay(retryScheduleDuration[0]);
    return getBalances(retryScheduleDuration.slice(1));
  }
};





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  // calculators
  calculateMarketStateDependantProps,

  // trades analysis
  analyzeTrades,

  // retrievers
  getBalances,
};
