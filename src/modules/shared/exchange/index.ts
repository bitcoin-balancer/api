import {
  assembleGetCandlesticks,
  assembleGetOrderBook,
  assembleGetOrderBookStream,
  assembleGetTickersStream,
  assembleGetTopSymbols,
} from './assembler.js';
import {
  ICandlestickInterval,
  IExchangeService,
  ITickerWebSocketMessage,
} from './types.js';

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

  // the list of intervals supported
  const CANDLESTICK_INTERVALS: ICandlestickInterval[] = ['1m', '5m', '15m', '30m', '1h', '1d', '1w'];





  /* **********************************************************************************************
   *                                          MARKET DATA                                         *
   ********************************************************************************************** */

  /**
   * Retrieves the candlestick records from the Exchange's API.
   * @param interval
   * @param limit
   * @param startTime?
   * @throws
   * - 12500: if the HTTP response code is not in the acceptedCodes
   * - 13500: if the response doesn't include a valid series of candlesticks (binance)
   * - 14500: if the response doesn't include a valid series of candlesticks (bitfinex)
   * - 15500: if the response is not an object or it is missing the error property (kraken)
   * - 15501: if the response contains errors (kraken)
   * - 15502: if the response does not contain a valid result property (kraken)
   * - 15503: if the response doesn't include a valid series of candlesticks (kraken)
   */
  const getCandlesticks = assembleGetCandlesticks();

  /**
   * Retrieves the current state of the order book for the base asset.
   * @returns Promise<IOrderBook>
   * @throws
   * - 12500: if the HTTP response code is not in the acceptedCodes
   * - 13502: if the order book object is invalid (binance)
   */
  const getOrderBook = assembleGetOrderBook();

  /**
   * Retrieves the stream for the order book updates.
   * @returns Observable<IOrderBookWebSocketMessage>
   */
  const getOrderBookStream = assembleGetOrderBookStream();

  /**
   * Retrieves the top coins by trading volume based on a whitelist.
   * @param whitelistedSymbols
   * @param limit
   * @returns Promise<string[]>
   * @throws
   * - 12500: if the HTTP response code is not in the acceptedCodes
   * - 13501: if the response doesn't include a valid series of tickers (binance)
   */
  const getTopSymbols = assembleGetTopSymbols();

  /**
   * Retrieves the tickers' stream for a list of topSymbols.
   * @param topSymbols
   * @returns Observable<ITickerWebSocketMessage>
   */
  const getTickersStream = assembleGetTickersStream();





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
    CANDLESTICK_INTERVALS,

    // market data
    getCandlesticks,
    getOrderBook,
    getOrderBookStream,
    getTopSymbols,
    getTickersStream,

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
  type ICandlestickInterval,
  type ITickerWebSocketMessage,
};
