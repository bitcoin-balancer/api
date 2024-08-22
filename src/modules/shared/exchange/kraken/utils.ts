import { toSeconds } from '../../utils/index.js';
import { IKrakenCandlestickInterval } from './types.js';

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





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  buildGetCandlesticksURL,
};
