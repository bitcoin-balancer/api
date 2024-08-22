import { sendGET } from 'fetch-request-node';
import { ENVIRONMENT } from '../../environment/index.js';
import { ICompactCandlestickRecords } from '../../candlestick/index.js';
import { ICandlestickInterval } from '../types.js';
import { transformCandlesticks } from './transformers.js';
import { IBitfinexService, ISupportedCandlestickIntervals } from './types.js';

/* ************************************************************************************************
 *                                         IMPLEMENTATION                                         *
 ************************************************************************************************ */

/**
 * Bitfinex Service Factory
 * Generates the object in charge of exposing Bitfinex's API in a modular manner.
 * @returns IBitfinexService
 */
const bitfinexServiceFactory = (): IBitfinexService => {
  /* **********************************************************************************************
   *                                          PROPERTIES                                          *
   ********************************************************************************************** */

  // the main symbol comprised by the base and quote asset
  const __SYMBOL = `t${ENVIRONMENT.EXCHANGE_CONFIGURATION.baseAsset}${ENVIRONMENT.EXCHANGE_CONFIGURATION.quoteAsset}`;

  // the supported candlestick intervals
  const __CANDLESTICK_INTERVALS: ISupportedCandlestickIntervals = {
    '1m': '1m',
    '5m': '5m',
    '15m': '15m',
    '30m': '30m',
    '1h': '1h',
    '1d': '1D',
    '1w': '1W',
  };





  /* **********************************************************************************************
   *                                          MARKET DATA                                         *
   ********************************************************************************************** */

  /**
   * Retrieves the candlestick records from Binance's API.
   * @param interval
   * @param limit
   * @param startTime?
   * @throws
   * - 12500: if the HTTP response code is not in the acceptedCodes
   * - ?
   */
  const getCandlesticks = async (
    interval: ICandlestickInterval,
    limit: number,
    startTime?: number,
  ): Promise<ICompactCandlestickRecords> => {
    // build the url
    let url: string = `https://data-api.binance.vision/api/v3/klines?symbol=${__SYMBOL}&interval=${interval}&limit=${limit}`;
    if (startTime) {
      url += `&startTime=${startTime}`;
    }

    // send and validate the req
    const res = await sendGET(url, { skipStatusCodeValidation: true });
    validateCandlesticksResponse(res);

    // finally, return the transformed candlesticks
    return transformCandlesticks(res.data);
  };





  /* **********************************************************************************************
   *                                         MODULE BUILD                                         *
   ********************************************************************************************** */
  return Object.freeze({
    // properties
    // ...

    // market data
    getCandlesticks,
  });
};





/* ************************************************************************************************
 *                                        GLOBAL INSTANCE                                         *
 ************************************************************************************************ */
const BitfinexService = bitfinexServiceFactory();





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  BitfinexService,
};
