import { assembleGetCandlesticks } from './assembler.js';
import { IExchangeService } from './types.js';

/* ************************************************************************************************
 *                                         IMPLEMENTATION                                         *
 ************************************************************************************************ */

/**
 * Exchange Service Factory
 * Generates the object in charge of brokering the communication with the Exchanges' APIs.
 * @returns IExchangeService
 */
const exchangeServiceFactory = (): IExchangeService => {
  /* **********************************************************************************************
   *                                          PROPERTIES                                          *
   ********************************************************************************************** */

  // ...





  /* **********************************************************************************************
   *                                          MARKET DATA                                         *
   ********************************************************************************************** */

  /**
   * Retrieves the candlestick records from Binance's API.
   * @param interval
   * @param limit
   * @param startTime?
   * @throws (binance)
   * - 13500: if the HTTP response code is not in the acceptedCodes
   * - 13501: if the response doesn't include a valid series of candlesticks
   */
  const getCandlesticks = assembleGetCandlesticks();





  /* **********************************************************************************************
   *                                         INITIALIZER                                          *
   ********************************************************************************************** */

  /**
   * Initializes the Market State Module.
   * @returns Promise<void>
   */
  const initialize = async (): Promise<void> => {

  };

  /**
   * Tears down the Market State Module.
   * @returns Promise<void>
   */
  const teardown = async (): Promise<void> => {

  };





  /* **********************************************************************************************
   *                                         MODULE BUILD                                         *
   ********************************************************************************************** */
  return Object.freeze({
    // properties
    // ...

    // market data
    getCandlesticks,

    // initializer
    initialize,
    teardown,
  });
};





/* ************************************************************************************************
 *                                        GLOBAL INSTANCE                                         *
 ************************************************************************************************ */
const ExchangeService = exchangeServiceFactory();





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  // service
  ExchangeService,

  // types
  // ...
};
