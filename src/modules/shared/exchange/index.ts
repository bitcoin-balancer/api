import {
  assembleGetCandlesticks,
  assembleGetOrderBook,
  assembleGetOrderBookStream,
  assembleGetTickersStream,
  assembleGetTopSymbols,
  assembleGetBalances,
  assembleListTrades,
  assembleBuy,
  assembleSell,
} from './assembler.js';
import {
  IExchangeService,
  ISide,
  ICandlestickInterval,
  IOrderBookWebSocketMessage,
  ITickerWebSocketMessage,
  IBalances,
  ITrade,
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
  const CANDLESTICK_INTERVALS: ICandlestickInterval[] = [
    '1m',
    '5m',
    '15m',
    '30m',
    '1h',
    '1d',
    '1w',
  ];

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
   * - 14502: if the response does not include a valid order book snapshot (bitfinex)
   * - 15500: if the response is not an object or it is missing the error property (kraken)
   * - 15501: if the response contains errors (kraken)
   * - 15502: if the response does not contain a valid result property (kraken)
   * - 15505: if the response doesn't include a valid order book object (kraken)
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
   * - 14501: if the response doesn't include a valid series of tickers (bitfinex)
   * - 15500: if the response is not an object or it is missing the error property (kraken)
   * - 15501: if the response contains errors (kraken)
   * - 15502: if the response does not contain a valid result property (kraken)
   * - 15504: if the response doesn't include a valid series of tickers (kraken)
   */
  const getTopSymbols = assembleGetTopSymbols();

  /**
   * Retrieves the tickers' stream for a list of topSymbols.
   * @param topSymbols
   * @returns Observable<ITickerWebSocketMessage>
   */
  const getTickersStream = assembleGetTickersStream();

  /* **********************************************************************************************
   *                                         ACCOUNT DATA                                         *
   ********************************************************************************************** */

  /**
   * Retrieves the account balances directly from Exchange's API.
   * @returns Promise<IBalances>
   * @throws
   * - 12500: if the HTTP response code is not in the acceptedCodes
   * - 13503: if the response didn't include a valid object (binance)
   * - 13504: if the response didn't include a valid list of balances (binance)
   * - 13750: if the balance for the base asset is not in the response object (binance)
   * - 13751: if the balance for the quote asset is not in the response object (binance)
   */
  const getBalances = assembleGetBalances();

  /**
   * Retrieves the list of trades starting at a time in milliseconds.
   * @param startAt
   * @returns Promise<ITrade[]>
   * @throws
   * - 12500: if the HTTP response code is not in the acceptedCodes
   * - 13505: if the response is not an array (binance)
   */
  const listTrades = assembleListTrades();

  /* **********************************************************************************************
   *                                       ACCOUNT ACTIONS                                        *
   ********************************************************************************************** */

  /**
   * Sends a buy order to the Exchange for a desired base asset amount.
   * @param amount
   * @returns Promise<Record<string, unknown>>
   * @throws
   * - 12500: if the HTTP response code is not in the acceptedCodes
   * - 13506: if the response is not a valid payload object (binance)
   */
  const buy = assembleBuy();

  /**
   * Sends a sell order to the Exchange for a desired base asset amount.
   * @param amount
   * @returns Promise<Record<string, unknown>>
   * @throws
   * - 12500: if the HTTP response code is not in the acceptedCodes
   * - 13506: if the response is not a valid payload object (binance)
   */
  const sell = assembleSell();

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

    // account data
    getBalances,
    listTrades,

    // account actions
    buy,
    sell,
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
  type ISide,
  type ICandlestickInterval,
  type IOrderBookWebSocketMessage,
  type ITickerWebSocketMessage,
  type IBalances,
  type ITrade,
};
