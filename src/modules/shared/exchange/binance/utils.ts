import { ICandlestickInterval } from '../types.js';

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





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  buildGetCandlesticksURL,
};
