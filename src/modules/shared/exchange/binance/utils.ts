import { ENVIRONMENT } from '../../environment/index.js';
import { IRecord } from '../../types.js';
import { ICandlestickInterval } from '../types.js';
import { IBinanceCoinTicker } from './types.js';

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
  interval: ICandlestickInterval,
  limit: number,
  startTime: number | undefined,
): string => {
  let url: string = `https://data-api.binance.vision/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`;
  if (startTime) {
    url += `&startTime=${startTime}`;
  }
  return url;
};

/**
 * builds the whitelist object from a list of symbols.
 * @param whitelistedSymbols
 * @param quoteAsset
 * @returns IRecord<string>
 */
const buildWhitelist = (whitelistedSymbols: string[], quoteAsset: string): IRecord<string> => (
  whitelistedSymbols.reduce(
    (previous, current) => ({ ...previous, [`${current}${quoteAsset}`]: current }),
    {},
  )
);

/**
 * Sorts the tickers by volume descendingly.
 * @param a
 * @param b
 * @returns number
 */
const tickersSortFunc = (a: IBinanceCoinTicker, b: IBinanceCoinTicker): number => (
  Number(b.quoteVolume) - Number(a.quoteVolume)
);

/**
 * Builds the pairs object based on the top symbols.
 * @param topSymbols
 * @returns <IRecord<string>>
 */
const buildTopPairsObject = (topSymbols: string[]): IRecord<string> => topSymbols.reduce(
  (previous, current) => ({
    ...previous,
    [`${current}${ENVIRONMENT.EXCHANGE_CONFIGURATION.quoteAsset}`]: current,
  }),
  <IRecord<string>>{},
);



/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  buildGetCandlesticksURL,
  buildWhitelist,
  tickersSortFunc,
  buildTopPairsObject,
};
