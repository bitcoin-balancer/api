import { sendGET } from 'fetch-request-node';
import { ENVIRONMENT } from '../../environment/index.js';
import { ICompactCandlestickRecords } from '../../candlestick/index.js';
import { ICandlestickInterval } from '../types.js';
import { validateCandlesticksResponse } from './validations.js';
import { transformCandlesticks } from './transformers.js';
import { IBinanceService } from './types.js';

/* ************************************************************************************************
 *                                         IMPLEMENTATION                                         *
 ************************************************************************************************ */

/**
 * Binance Service Factory
 * Generates the object in charge of exposing Binance's API in a modular manner.
 * @returns IBinanceService
 */
const binanceServiceFactory = (): IBinanceService => {
  /* **********************************************************************************************
   *                                          PROPERTIES                                          *
   ********************************************************************************************** */

  // the main symbol comprised by the base and quote asset
  const __SYMBOL = `${ENVIRONMENT.EXCHANGES_CONFIGURATION.baseAsset}${ENVIRONMENT.EXCHANGES_CONFIGURATION.quoteAsset}`;





  /* **********************************************************************************************
   *                                          MARKET DATA                                         *
   ********************************************************************************************** */

  /**
   * Retrieves the candlestick records from Binance's API.
   * @param interval
   * @param limit
   * @param startTime?
   * @throws
   * - 13500: if the HTTP response code is not in the acceptedCodes
   * - 13501: if the response doesn't include a valid series of candlesticks
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
    const res = await sendGET(url);
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
const BinanceService = binanceServiceFactory();





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  BinanceService,
};
