import { IRecord } from '../../types.js';
import {
  IBitfinexCandlestickInterval,
  IBitfinexCoinTicker,
  IBitfinexTickerWebSocketSubscription,
} from './types.js';

/* ************************************************************************************************
 *                                         IMPLEMENTATION                                         *
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





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  buildGetCandlesticksURL,
  tickersSortFunc,
  buildWhitelist,
  buildTopPairsObject,
  buildSubscriptionForTicker,
};
