import { sendGET } from 'fetch-request-node';
import { ICompactCandlestickRecords } from '../../candlestick/index.js';
import { ICandlestickInterval } from '../types.js';
import { buildGetCandlesticksURL } from './utils.js';
import { validateCandlesticksResponse } from './validations.js';
import { transformCandlesticks } from './transformers.js';
import { IKrakenService, ISupportedCandlestickIntervals } from './types.js';

/* ************************************************************************************************
 *                                         IMPLEMENTATION                                         *
 ************************************************************************************************ */

/**
 * Kraken Service Factory
 * Generates the object in charge of exposing Kraken's API in a modular manner.
 * @returns IKrakenService
 */
const krakenServiceFactory = (): IKrakenService => {
  /* **********************************************************************************************
   *                                          PROPERTIES                                          *
   ********************************************************************************************** */

  // the main symbol comprised by the base and quote asset
  const __SYMBOL = 'XBTUSD';

  // the supported candlestick intervals
  const __CANDLESTICK_INTERVALS: ISupportedCandlestickIntervals = {
    '1m': 1,
    '5m': 5,
    '15m': 15,
    '30m': 30,
    '1h': 60,
    '1d': 1440,
    '1w': 10080,
  };





  /* **********************************************************************************************
   *                                          MARKET DATA                                         *
   ********************************************************************************************** */

  /**
   * Retrieves the candlestick records from Kraken's API.
   * @param interval
   * @param limit
   * @param startTime?
   * @throws
   * - 12500: if the HTTP response code is not in the acceptedCodes
   * - 15500: if the response is not an object or it is missing the error property
   * - 15501: if the response contains errors
   * - 15502: if the response does not contain a valid result property
   * - 15503: if the response doesn't include a valid series of candlesticks
   */
  const getCandlesticks = async (
    interval: ICandlestickInterval,
    limit: number,
    startTime?: number,
  ): Promise<ICompactCandlestickRecords> => {
    // send and validate the req
    const res = await sendGET(
      buildGetCandlesticksURL(__SYMBOL, __CANDLESTICK_INTERVALS[interval], startTime),
      { skipStatusCodeValidation: true },
    );
    validateCandlesticksResponse(res, 'XXBTZUSD');

    // finally, return the transformed candlesticks
    return transformCandlesticks(res.data.result.XXBTZUSD.slice(-(limit)));
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
const KrakenService = krakenServiceFactory();





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  KrakenService,
};
