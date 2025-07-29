import { stringify } from 'node:querystring';
import { createHmac } from 'node:crypto';
import { ENVIRONMENT } from '../../environment/index.js';
import { ICandlestickInterval } from '../types.js';
import { IBinanceCoinTicker } from './types.js';

/* ************************************************************************************************
 *                                         IMPLEMENTATION                                         *
 ************************************************************************************************ */

/**
 * Builds and signs the parameters that will be sent to Binance's API.
 * @param secret
 * @param rawParams
 */
const signParams = (secret: string, rawParams?: Record<string, any>): string => {
  // init the params
  const params = rawParams ?? {};
  params.recvWindow = 5000;
  params.timestamp = Date.now();

  // generate a URL query string from the parameters
  const queryString = stringify(params);

  // sign the parameters and return them
  const signedParams = createHmac('sha256', secret).update(queryString).digest('hex');
  return `${queryString}&signature=${signedParams}`;
};

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
 * Sorts the tickers by volume descendingly.
 * @param a
 * @param b
 * @returns number
 */
const tickersSortFunc = (a: IBinanceCoinTicker, b: IBinanceCoinTicker): number =>
  Number(b.quoteVolume) - Number(a.quoteVolume);

/**
 * Builds the whitelist object from a list of symbols.
 * @param whitelistedSymbols
 * @param quoteAsset
 * @returns Record<string ,string>
 */
const buildWhitelist = (whitelistedSymbols: string[], quoteAsset: string): Record<string, string> =>
  whitelistedSymbols.reduce(
    (previous, current) => ({ ...previous, [`${current}${quoteAsset}`]: current }),
    {},
  );

/**
 * Builds the pairs object based on the top symbols.
 * @param topSymbols
 * @returns Record<string, string>
 */
const buildTopPairsObject = (topSymbols: string[]): Record<string, string> =>
  topSymbols.reduce(
    (previous, current) => ({
      ...previous,
      [`${current}${ENVIRONMENT.EXCHANGE_CONFIGURATION.quoteAsset}`]: current,
    }),
    <Record<string, string>>{},
  );

/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  signParams,
  buildGetCandlesticksURL,
  tickersSortFunc,
  buildWhitelist,
  buildTopPairsObject,
};
