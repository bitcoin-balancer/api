import { encodeError } from 'error-message-utils';
import { ENVIRONMENT } from '../../environment/index.js';
import {
  ICompactCandlestickRecords,
  buildPristineCompactCandlestickRecords,
} from '../../candlestick/index.js';
import {
  IOrderBook,
  IOrderBookWebSocketMessage,
  ITickerWebSocketMessage,
  IBalances,
  ITrade,
} from '../types.js';
import {
  IBinanceCandlestick,
  IBinanceOrderBook,
  IBinanceOrderBookWebSocketMessage,
  IBinanceTickerWebSocketMessage,
  IBinanceAccountInformation,
  IBinanceAccountTrade,
} from './types.js';

/* ************************************************************************************************
 *                                         IMPLEMENTATION                                         *
 ************************************************************************************************ */

/**
 * Transforms raw Binance candlesticks into a compact candlestick records object.
 * @param source
 * @returns ICompactCandlestickRecords
 */
const transformCandlesticks = (source: IBinanceCandlestick[]): ICompactCandlestickRecords =>
  source.reduce((prev, current) => {
    prev.id.push(current[0]);
    prev.open.push(Number(current[1]));
    prev.high.push(Number(current[2]));
    prev.low.push(Number(current[3]));
    prev.close.push(Number(current[4]));
    return prev;
  }, buildPristineCompactCandlestickRecords());

/**
 * Converts a string tuple into a numeric one.
 * @param order
 * @returns [number, number]
 */
const __transformOrder = (order: [string, string]): [number, number] => [
  Number(order[0]),
  Number(order[1]),
];

/**
 * Transforms a raw Binance Order Book into the object required by the Exchange.
 * @param source
 * @returns IOrderBook
 */
const transformOrderBook = (source: IBinanceOrderBook): IOrderBook => ({
  asks: source.asks.map(__transformOrder),
  bids: source.bids.map(__transformOrder),
  lastUpdateID: source.lastUpdateId,
});

/**
 * Transforms an order book update object into the websocket message required by the Exchange.
 * @param source
 * @returns IOrderBookWebSocketMessage
 */
const transformOrderBookMessage = (
  source: IBinanceOrderBookWebSocketMessage,
): IOrderBookWebSocketMessage => ({
  asks: source.a.map(__transformOrder),
  bids: source.b.map(__transformOrder),
  finalUpdateID: source.u,
});

/**
 * Transforms the ticker message received through the WebSocket into the general message type.
 * @param topPairs
 * @param tickers
 * @returns ITickerWebSocketMessage
 */
const transformTickers = (
  topPairs: Record<string, string>,
  tickers: IBinanceTickerWebSocketMessage,
): ITickerWebSocketMessage =>
  tickers.reduce((previous, current) => {
    if (topPairs[current.s]) {
      return { ...previous, [topPairs[current.s]]: Number(current.c) };
    }
    return previous;
  }, {});

/**
 * Transforms the raw account info object into the Balances object required by the Exchange.
 * @param data
 * @returns IBalances
 * @throws
 * - 13750: if the balance for the base asset is not in the response object
 * - 13751: if the balance for the quote asset is not in the response object
 */
const transformBalances = (data: IBinanceAccountInformation): IBalances => {
  const base = data.balances.find(
    (balanceObj) => balanceObj.asset === ENVIRONMENT.EXCHANGE_CONFIGURATION.baseAsset,
  );
  const quote = data.balances.find(
    (balanceObj) => balanceObj.asset === ENVIRONMENT.EXCHANGE_CONFIGURATION.quoteAsset,
  );
  if (base === undefined) {
    throw new Error(
      encodeError(
        `The balance for the base asset (${ENVIRONMENT.EXCHANGE_CONFIGURATION.baseAsset}) could not be extracted from Binance's response.`,
        13750,
      ),
    );
  }
  if (quote === undefined) {
    throw new Error(
      encodeError(
        `The balance for the quote asset (${ENVIRONMENT.EXCHANGE_CONFIGURATION.quoteAsset}) could not be extracted from Binance's response.`,
        13751,
      ),
    );
  }
  return {
    [ENVIRONMENT.EXCHANGE_CONFIGURATION.baseAsset]: Number(base.free),
    [ENVIRONMENT.EXCHANGE_CONFIGURATION.quoteAsset]: Number(quote.free),
    refetchTime: Date.now(),
  };
};

/**
 * Transforms a list of Binance trades into the objects required by the Exchange.
 * @param rawTrades
 * @returns ITrade[]
 */
const transformTrades = (rawTrades: IBinanceAccountTrade[]): ITrade[] =>
  rawTrades.map((trade) => ({
    id_alt: String(trade.id),
    side: trade.isBuyer ? 'BUY' : 'SELL',
    price: Number(trade.price),
    amount: Number(trade.qty),
    amount_quote: Number(trade.quoteQty),
    comission: Number(trade.commission),
    event_time: trade.time,
  }));

/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  transformCandlesticks,
  transformTickers,
  transformOrderBook,
  transformOrderBookMessage,
  transformBalances,
  transformTrades,
};
