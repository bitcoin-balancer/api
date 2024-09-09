import { Observable } from 'rxjs';
import { sendGET } from 'fetch-request-node';
import { ENVIRONMENT } from '../../environment/index.js';
import { ICompactCandlestickRecords } from '../../../candlestick/index.js';
import { websocketFactory } from '../../websocket/index.js';
import {
  ICandlestickInterval,
  IOrderBook,
  IOrderBookWebSocketMessage,
  ITickerWebSocketMessage,
  IBalances,
} from '../types.js';
import {
  signParams,
  buildGetCandlesticksURL,
  buildWhitelist,
  tickersSortFunc,
  buildTopPairsObject,
} from './utils.js';
import {
  validateCandlesticksResponse,
  validateOrderBookResponse,
  validateTickersResponse,
  validateBalancesResponse,
} from './validations.js';
import {
  transformCandlesticks,
  transformOrderBook,
  transformOrderBookMessage,
  transformTickers,
  transformBalances,
} from './transformers.js';
import {
  IBinanceService,
  IBinanceOrderBookWebSocketMessage,
  IBinanceCoinTicker,
  IBinanceTickerWebSocketMessage,
} from './types.js';

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
  const __SYMBOL = `${ENVIRONMENT.EXCHANGE_CONFIGURATION.baseAsset}${ENVIRONMENT.EXCHANGE_CONFIGURATION.quoteAsset}`;

  // the credentials to be used for authenticated requests
  const __CREDENTIALS = ENVIRONMENT.EXCHANGE_CREDENTIALS.binance;

  // the headers needed to interact with authenticated endpoints
  const __AUTH_HEADERS = new Headers(
    __CREDENTIALS === undefined ? {} : { 'X-MBX-APIKEY': __CREDENTIALS.key },
  );




  /* **********************************************************************************************
   *                                          MARKET DATA                                         *
   ********************************************************************************************** */

  /**
   * Candlesticks
   */

  /**
   * Retrieves the candlestick records from Binance's API.
   * @param interval
   * @param limit
   * @param startTime?
   * @throws
   * - 12500: if the HTTP response code is not in the acceptedCodes
   * - 13500: if the response doesn't include a valid series of candlesticks
   */
  const getCandlesticks = async (
    interval: ICandlestickInterval,
    limit: number,
    startTime?: number,
  ): Promise<ICompactCandlestickRecords> => {
    const res = await sendGET(
      buildGetCandlesticksURL(__SYMBOL, interval, limit, startTime),
      { skipStatusCodeValidation: true },
    );
    validateCandlesticksResponse(res);
    return transformCandlesticks(res.data);
  };

  /**
   * Order Book
   */

  /**
   * Retrieves the current state of Binance's order book for the base asset.
   * @returns Promise<IOrderBook>
   * @throws
   * - 12500: if the HTTP response code is not in the acceptedCodes
   * - 13502: if the order book object is invalid
   */
  const getOrderBook = async (): Promise<IOrderBook> => {
    const res = await sendGET(
      `https://data-api.binance.vision/api/v3/depth?symbol=${__SYMBOL}&limit=5000`,
      { skipStatusCodeValidation: true },
    );
    validateOrderBookResponse(res);
    return transformOrderBook(res.data);
  };

  /**
   * Retrieves the stream for the order book updates.
   * @returns Observable<IOrderBookWebSocketMessage>
   */
  const getOrderBookStream = (): Observable<IOrderBookWebSocketMessage> => (
    new Observable<IOrderBookWebSocketMessage>((subscriber) => {
      const ws = websocketFactory<IBinanceOrderBookWebSocketMessage>(
        'LIQUIDITY',
        `wss://data-stream.binance.vision:9443/ws/${__SYMBOL.toLocaleLowerCase()}@depth@100ms`,
        (msg) => subscriber.next(transformOrderBookMessage(msg)),
      );
      return function unsubscribe() {
        ws.off();
      };
    })
  );

  /**
   * Tickers
   */

  /**
   * Retrieves the dollar-based tickers ordered by volume descendingly from Binance's API.
   * @returns Promise<IBinanceCoinTicker[]>
   * @throws
   * - 12500: if the HTTP response code is not in the acceptedCodes
   * - 13501: if the response doesn't include a valid series of tickers
   */
  const __getTickers = async (): Promise<IBinanceCoinTicker[]> => {
    const res = await sendGET(
      'https://data-api.binance.vision/api/v3/ticker/24hr?type=MINI',
      { skipStatusCodeValidation: true },
    );
    validateTickersResponse(res);
    res.data.sort(tickersSortFunc);
    return res.data;
  };

  /**
   * Retrieves the top coins by trading volume based on a whitelist.
   * @param whitelistedSymbols
   * @param limit
   * @returns Promise<string[]>
   * @throws
   * - 12500: if the HTTP response code is not in the acceptedCodes
   * - 13501: if the response doesn't include a valid series of tickers
   */
  const getTopSymbols = async (whitelistedSymbols: string[], limit: number): Promise<string[]> => {
    // init values
    const whitelist = buildWhitelist(
      whitelistedSymbols,
      ENVIRONMENT.EXCHANGE_CONFIGURATION.quoteAsset,
    );
    const coins = [];

    // retrieve the tickers
    const tickers = await __getTickers();

    // iterate until the optimal number of coins have been selected
    let i = 0;
    while (i < tickers.length && coins.length < limit) {
      if (whitelist[tickers[i].symbol]) {
        coins.push(whitelist[tickers[i].symbol]);
      }
      i += 1;
    }

    // return only the top based on their volume
    return coins.slice(0, limit);
  };

  /**
   * Retrieves the tickers' stream for a list of topSymbols.
   * @param topSymbols
   * @returns Observable<ITickerWebSocketMessage>
   */
  const getTickersStream = (topSymbols: string[]): Observable<ITickerWebSocketMessage> => (
    new Observable<ITickerWebSocketMessage>((subscriber) => {
      // build the pairs object
      const topPairs = buildTopPairsObject(topSymbols);

      // instantiate the websocket
      const ws = websocketFactory<IBinanceTickerWebSocketMessage>(
        'COINS',
        'wss://data-stream.binance.vision:9443/ws/!miniTicker@arr',
        (tickers) => subscriber.next(transformTickers(topPairs, tickers)),
      );
      return function unsubscribe() {
        ws.off();
      };
    })
  );





  /* **********************************************************************************************
   *                                         ACCOUNT DATA                                         *
   ********************************************************************************************** */

  /**
   * Retrieves the account balances directly from Binance's API.
   * @returns Promise<IBalances>
   * @throws
   * - 12500: if the HTTP response code is not in the acceptedCodes
   * - 13503: if the response didn't include a valid object
   * - 13504: if the response didn't include a valid list of balances
   * - 13750: if the balance for the base asset is not in the response object
   * - 13751: if the balance for the quote asset is not in the response object
   */
  const getBalances = async (): Promise<IBalances> => {
    const res = await sendGET(
      `https://api.binance.com/api/v3/account?${signParams(__CREDENTIALS.secret)}`,
      { requestOptions: { headers: __AUTH_HEADERS }, skipStatusCodeValidation: true },
    );
    validateBalancesResponse(res);
    return transformBalances(res.data);
  };





  /* **********************************************************************************************
   *                                         MODULE BUILD                                         *
   ********************************************************************************************** */
  return Object.freeze({
    // properties
    // ...

    // market data
    getCandlesticks,
    getOrderBook,
    getOrderBookStream,
    getTopSymbols,
    getTickersStream,

    // account data
    getBalances,
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
