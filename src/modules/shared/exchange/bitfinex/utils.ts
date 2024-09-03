import { IRecord } from '../../types.js';
import {
  IBitfinexCandlestickInterval,
  IBitfinexWebSocketMessage,
  IBitfinexOrderBookWebSocketSubscription,
  IBitfinexOrderBookWebSocketMessage,
  IBitfinexCoinTicker,
  IBitfinexTickerWebSocketMessageData,
  IBitfinexTickerWebSocketSubscription,
} from './types.js';

/* ************************************************************************************************
 *                                          CANDLESTICKS                                          *
 ************************************************************************************************ */

/**
 * Builds the URL for the endpoint to retrieve candlesticks from the Binance API.
 * @param symbol
 * @param interval
 * @param limit
 * @param startTime
 * @returns string
 */
const buildGetCandlesticksURL = (
  symbol: string,
  interval: IBitfinexCandlestickInterval,
  limit: number,
  startTime: number | undefined,
): string => {
  let url: string = `https://api-pub.bitfinex.com/v2/candles/trade:${interval}:${symbol}/hist?limit=${limit}`;
  if (startTime) {
    url += `&start=${startTime}`;
  }
  return url;
};





/* ************************************************************************************************
 *                                           ORDER BOOK                                           *
 ************************************************************************************************ */

/**
 * Builds the object used to subscribe to the order book stream.
 * @param symbol
 * @returns string
 */
const buildSubscriptionForOrderBook = (symbol: string): string => (
  JSON.stringify(<IBitfinexOrderBookWebSocketSubscription>{
    event: 'subscribe',
    symbol,
    channel: 'book',
    prec: 'P0',
    len: 250,
    freq: 'F0',
  })
);

/**
 * Checks if a WebSocket message belongs to an order book update.
 * @param msg
 * @returns boolean
 */
const isOrderBookWebSocketMessage = (
  msg: IBitfinexWebSocketMessage,
): msg is IBitfinexOrderBookWebSocketMessage => (
  Array.isArray(msg) && Array.isArray(msg[1]) && typeof msg[1][0] === 'number'
);





/* ************************************************************************************************
 *                                            TICKERS                                             *
 ************************************************************************************************ */

/**
 * Sorts the tickers by volume descendingly.
 * @param a
 * @param b
 * @returns number
 */
const tickersSortFunc = (a: IBitfinexCoinTicker, b: IBitfinexCoinTicker): number => (
  (b[8] * b[7]) - (a[8] * a[7])
);

/**
 * Builds the whitelist object from a list of symbols.
 * @param whitelistedSymbols
 * @param quoteAsset
 * @returns IRecord<string>
 */
const buildWhitelist = (whitelistedSymbols: string[], quoteAsset: string): IRecord<string> => (
  whitelistedSymbols.reduce(
    (previous, current) => ({ ...previous, [`t${current}${quoteAsset}`]: current }),
    {},
  )
);

/**
 * Builds the pairs object based on the top symbols.
 * @param topSymbols
 * @returns <IRecord<string>>
 */
const buildTopPairsObject = (topSymbols: string[], quoteAsset: string): IRecord<string> => (
  topSymbols.reduce(
    (previous, current) => ({
      ...previous,
      [`t${current}${quoteAsset}`]: current,
    }),
    <IRecord<string>>{},
  )
);

/**
 * Builds the object used to subscribe to a symbol's ticker stream.
 * @param symbol
 * @returns string
 */
const buildSubscriptionForTicker = (symbol: string): string => (
  JSON.stringify(<IBitfinexTickerWebSocketSubscription>{
    event: 'subscribe',
    channel: 'ticker',
    symbol,
  })
);

/**
 * Checks if a websocket message belongs to a ticker.
 * @param value
 * @returns boolean
 */
const isTickerWebsocketMessage = (value: unknown): value is IBitfinexTickerWebSocketMessageData => (
  Array.isArray(value)
);





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  // candlesticks
  buildGetCandlesticksURL,

  // order book
  buildSubscriptionForOrderBook,
  isOrderBookWebSocketMessage,

  // tickers
  tickersSortFunc,
  buildWhitelist,
  buildTopPairsObject,
  buildSubscriptionForTicker,
  isTickerWebsocketMessage,
};
