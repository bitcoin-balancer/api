import {
  getBigNumber,
  processValue,
  calculatePercentageChange,
  calculateWeightedEntry,
  adjustByPercentage,
} from 'bignumber-utils';
import { delay } from '../shared/utils/index.js';
import { generateUUID } from '../shared/uuid/index.js';
import { IBalances, ITrade } from '../shared/exchange/index.js';
import { IDecreaseLevels } from './strategy/index.js';
import { BalanceService } from './balance/index.js';
import { TransactionService } from './transaction/index.js';
import {
  IDecreasePriceLevels,
  IMarketStateDependantProps,
  IPosition,
  IPositionAction,
  ITradesAnalysis,
} from './types.js';

/* ************************************************************************************************
 *                                          CALCULATORS                                           *
 ************************************************************************************************ */

/**
 * Calculates the decrease price levels based on the strategy's decrease levels.
 * @param entryPrice
 * @param decreaseLevels
 * @returns IDecreasePriceLevels
 */
const __calculateDecreasePriceLevels = (
  entryPrice: number,
  decreaseLevels: IDecreaseLevels,
): IDecreasePriceLevels => decreaseLevels.map(
  (lvl) => adjustByPercentage(entryPrice, lvl.gainRequirement),
) as IDecreasePriceLevels;





/* ************************************************************************************************
 *                                   POSITION CHANGES HANDLING                                    *
 ************************************************************************************************ */

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
  const amountQuote = getBigNumber(amount).times(marketPrice);
  const unrealizedAmountQuoteOut = amountQuote.plus(amountQuoteOut);

  // finally, pack and return the results
  return {
    gain: calculatePercentageChange(entryPrice, marketPrice),
    amount_quote: processValue(amountQuote),
    pnl: processValue(unrealizedAmountQuoteOut.minus(amountQuoteIn)),
    roi: calculatePercentageChange(amountQuoteIn, unrealizedAmountQuoteOut),
  };
};

/**
 * Analysis a list of trades and returns a summarized object containing the most relevant info
 * ready to be inserted into the position record.
 * @param trades
 * @param currentPrice
 * @returns ITradesAnalysis | undefined
 */
const analyzeTrades = (
  trades: ITrade[],
  currentPrice: number,
  decreaseLevels: IDecreaseLevels,
): ITradesAnalysis | undefined => {
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

  // calculate the new entry price
  const entryPrice = calculateWeightedEntry(buyTrades);

  // finally, return the analysis
  return {
    open: trades[0].event_time,
    close: amount.isEqualTo(0) ? trades[trades.length - 1].event_time : null,
    entry_price: entryPrice,
    amount: processValue(amount, { decimalPlaces: 8, roundingMode: 'ROUND_HALF_DOWN' }),
    amount_quote: amountQuote,
    amount_quote_in: processValue(amountQuoteIn),
    amount_quote_out: processValue(amountQuoteOut),
    pnl: processValue(unrealizedAmountQuoteOut.minus(amountQuoteIn)),
    roi: calculatePercentageChange(amountQuoteIn, unrealizedAmountQuoteOut),
    decrease_price_levels: __calculateDecreasePriceLevels(entryPrice, decreaseLevels),
  };
};





/* ************************************************************************************************
 *                                         BUILD HELPERS                                          *
 ************************************************************************************************ */

/**
 * Builds a position action and calculates the timestamp at which the next event can take place.
 * @param txID
 * @param idleMinutes
 * @returns IPositionAction
 */
const buildPositionAction = (txID: number | undefined, idleMinutes: number): IPositionAction => {
  const currentTime = Date.now();
  return {
    txID: typeof txID === 'number' ? txID : 0,
    eventTime: currentTime,
    nextEventTime: currentTime + ((idleMinutes * 60) * 1000),
  };
};

/**
 * Builds the position record based on the initial trades and the strategy.
 * @param trades
 * @param currentPrice
 * @param increaseIdleDuration
 * @returns Promise<IPosition>
 */
const buildNewPosition = async (
  trades: ITradesAnalysis,
  currentPrice: number,
  increaseIdleDuration: number,
): Promise<IPosition> => {
  const lastTranctionID = await TransactionService.getLastBuyTransactionID();
  return {
    id: generateUUID(),
    ...calculateMarketStateDependantProps(
      currentPrice,
      trades.entry_price,
      trades.amount,
      trades.amount_quote_in,
      trades.amount_quote_out,
    ),
    ...trades,
    increase_actions: [buildPositionAction(lastTranctionID, increaseIdleDuration * 60)],
    decrease_actions: [[], [], [], [], []],
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


  // position changes handling
  calculateMarketStateDependantProps,
  analyzeTrades,

  // build helpers
  buildPositionAction,
  buildNewPosition,

  // retrievers
  getBalances,
};
