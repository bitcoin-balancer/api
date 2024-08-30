import { IRecord } from '../../types.js';
import { toSeconds } from '../../utils/index.js';
import {
  IKrakenCandlestickInterval,
  IKrakenCoinTicker,
  IKrakenTickerWebSocketSubscription,
} from './types.js';

/* ************************************************************************************************
 *                                         IMPLEMENTATION                                         *
 ************************************************************************************************ */

/**
 * Builds the URL for the endpoint to retrieve candlesticks from the Kraken API.
 * @param symbol
 * @param interval
 * @param startTime
 * @returns string
 */
const buildGetCandlesticksURL = (
  symbol: string,
  interval: IKrakenCandlestickInterval,
  startTime: number | undefined,
): string => {
  let url: string = `https://api.kraken.com/0/public/OHLC?pair=${symbol}&interval=${interval}`;
  if (startTime) {
    url += `&since=${toSeconds(startTime) - 1}`;
  }
  return url;
};

/**
 * Sorts the tickers by volume descendingly.
 * @param a
 * @param b
 * @returns number
 */
const tickersSortFunc = (
  a: [string, IKrakenCoinTicker],
  b: [string, IKrakenCoinTicker],
): number => (
  (Number(b[1].v[1]) * Number(b[1].c[0])) - (Number(a[1].v[1]) * Number(a[1].c[0]))
);

/**
 * Builds the whitelist object from a list of symbols.
 * @param whitelistedSymbols
 * @param quoteAsset
 * @returns IRecord<string>
 */
const buildWhitelist = (whitelistedSymbols: string[]): IRecord<string> => (
  whitelistedSymbols.reduce(
    (previous, current) => ({
      ...previous,
      [`${current}USD`]: current,
      [`${current}USDT`]: current,
      [`${current}USDC`]: current,
    }),
    {
      XBTUSD: 'BTC',
      XBTUSDT: 'BTC',
      XBTUSDC: 'BTC',
    },
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
      [`t${current}/${quoteAsset}`]: current,
    }),
    <IRecord<string>>{},
  )
);

/**
 * Builds the object that is used to subscribes to the tickers' stream for all top symbols.
 * @param topPairs
 * @returns string
 */
const buildSubscriptionForTickers = (topPairs: string[]): string => (
  JSON.stringify(<IKrakenTickerWebSocketSubscription>{
    method: 'subscribe',
    params: {
      channel: 'ticker',
      symbol: topPairs,
      event_trigger: 'trades',
      snapshot: true,
    },
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
  buildSubscriptionForTickers,
};
