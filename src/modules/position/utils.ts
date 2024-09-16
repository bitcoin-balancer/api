import {
  IBigNumber,
  getBigNumber,
  processValue,
  calculatePercentageChange,
  calculateWeightedEntry,
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
 * Analysis a list of trades and returns a summarized object containing the most relevant info
 * ready to be inserted into the position record.
 * @param trades
 * @param currentPrice
 * @returns ITradesAnalysis | undefined
 */
const analyzeTrades = (trades: ITrade[], currentPrice: number): ITradesAnalysis | undefined => {
  // do not analyze if there are no trades
  if (trades.length === 0) {
    return undefined;
  }

  // init values and iterate over each trade
  let amount = getBigNumber(0);
  let amountQuoteIn = getBigNumber(0);
  let amountQuoteOut = getBigNumber(0);
  const buyTrades: Array<[number, number]> = [];
  trades.forEach((trade) => {
    if (trade.side === 'BUY') {
      amount = amount.plus(trade.amount);
      amountQuoteIn = amountQuoteIn.plus(trade.amount_quote);
      buyTrades.push([trade.price, trade.amount]);
    } else {
      amount = amount.minus(trade.amount);
      amountQuoteOut = amountQuoteOut.plus(trade.amount_quote);
    }
  });

  // calculate the position amount in quote asset
  const amountQuote = processValue(amount.times(currentPrice));

  // calculate the unrealized amount (quote)
  const unrealizedAmountQuoteOut = amountQuoteOut.plus(amountQuote);

  // finally, return the analysis
  return {
    open: trades[0].event_time,
    close: amount.isEqualTo(0) ? trades[trades.length - 1].event_time : null,
    entry_price: calculateWeightedEntry(buyTrades),
    amount: processValue(amount, { decimalPlaces: 8, roundingMode: 'ROUND_HALF_DOWN' }),
    amount_quote: amountQuote,
    amount_quote_in: processValue(amountQuoteIn),
    amount_quote_out: processValue(amountQuoteOut),
    pnl: processValue(unrealizedAmountQuoteOut.minus(amountQuoteIn)),
    roi: calculatePercentageChange(amountQuoteIn, unrealizedAmountQuoteOut),
  };
};





/* ************************************************************************************************
 *                                           RETRIEVERS                                           *
 ************************************************************************************************ */

/**
 * Attempts to retrieve the initial balances in a very persistent manner.
 * @param retryScheduleDuration?
 * @returns Promise<IBalances>
 * @throws
 * - 12500: if the HTTP response code is not in the acceptedCodes
 * - 13503: if the response didn't include a valid object (binance)
 * - 13504: if the response didn't include a valid list of balances (binance)
 * - 13750: if the balance for the base asset is not in the response object (binance)
 * - 13751: if the balance for the quote asset is not in the response object (binance)
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
