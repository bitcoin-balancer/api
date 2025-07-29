import { Observable } from 'rxjs';
import { sendGET, sendPOST } from 'fetch-request-node';
import { ENVIRONMENT } from '../../environment/index.js';
import { ICompactCandlestickRecords } from '../../candlestick/index.js';
import { websocketFactory } from '../../websocket/index.js';
import {
  ICandlestickInterval,
  IOrderBook,
  IOrderBookWebSocketMessage,
  ITickerWebSocketMessage,
  IBalances,
  ITrade,
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
  validateTradesResponse,
  validateOrderExecutionResponse,
} from './validations.js';
import {
  transformCandlesticks,
  transformOrderBook,
  transformOrderBookMessage,
  transformTickers,
  transformBalances,
  transformTrades,
} from './transformers.js';
import {
  IBinanceService,
  IBinanceOrderBookWebSocketMessage,
  IBinanceSide,
  IBinanceCoinTicker,
  IBinanceTickerWebSocketMessage,
  IBinanceOrderExecutionResponse,
  IBinanceCandlestick,
  IBinanceOrderBook,
  IBinanceAccountInformation,
  IBinanceAccountTrade,
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
  const __AUTH_HEADERS = new Headers({
    'X-MBX-APIKEY': __CREDENTIALS === undefined ? '' : __CREDENTIALS.key,
  });

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
    const res = await sendGET<IBinanceCandlestick[]>(
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
    const res = await sendGET<IBinanceOrderBook>(
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
  const getOrderBookStream = (): Observable<IOrderBookWebSocketMessage> =>
    new Observable<IOrderBookWebSocketMessage>((subscriber) => {
      const ws = websocketFactory<IBinanceOrderBookWebSocketMessage>(
        'LIQUIDITY',
        `wss://data-stream.binance.vision:9443/ws/${__SYMBOL.toLocaleLowerCase()}@depth@100ms`,
        (msg) => subscriber.next(transformOrderBookMessage(msg)),
      );
      return function unsubscribe() {
        ws.off();
      };
    });

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
    const res = await sendGET<IBinanceCoinTicker[]>(
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
  const getTickersStream = (topSymbols: string[]): Observable<ITickerWebSocketMessage> =>
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
    });

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
    const res = await sendGET<IBinanceAccountInformation>(
      `https://api.binance.com/api/v3/account?${signParams(__CREDENTIALS.secret)}`,
      { requestOptions: { headers: __AUTH_HEADERS }, skipStatusCodeValidation: true },
    );
    validateBalancesResponse(res);
    return transformBalances(res.data);
  };

  /**
   * Retrieves the list of trades starting at a time in milliseconds.
   * @param startAt
   * @returns Promise<ITrade[]>
   * @throws
   * - 12500: if the HTTP response code is not in the acceptedCodes
   * - 13505: if the response is not an array
   */
  const listTrades = async (startAt: number): Promise<ITrade[]> => {
    const res = await sendGET<IBinanceAccountTrade[]>(
      `https://api.binance.com/api/v3/myTrades?${signParams(__CREDENTIALS.secret, {
        symbol: __SYMBOL,
        startTime: startAt,
        limit: 1000,
      })}`,
      { requestOptions: { headers: __AUTH_HEADERS }, skipStatusCodeValidation: true },
    );
    validateTradesResponse(res);
    return transformTrades(res.data);
  };

  /* **********************************************************************************************
   *                                       ACCOUNT ACTIONS                                        *
   ********************************************************************************************** */

  /**
   * Sends an order to be executed by Binance and returns the execution payload.
   * @param side
   * @param amount
   * @returns Promise<IBinanceOrderExecutionResponse>
   * @throws
   * - 12500: if the HTTP response code is not in the acceptedCodes
   * - 13506: if the response is not a valid payload object
   */
  const __order = async (
    side: IBinanceSide,
    amount: number,
  ): Promise<IBinanceOrderExecutionResponse> => {
    const res = await sendPOST<IBinanceOrderExecutionResponse>(
      `https://api.binance.com/api/v3/order?${signParams(__CREDENTIALS.secret, {
        symbol: __SYMBOL,
        side,
        type: 'MARKET',
        quantity: amount,
      })}`,
      { requestOptions: { headers: __AUTH_HEADERS }, skipStatusCodeValidation: true },
    );
    validateOrderExecutionResponse(res);
    return res.data;
  };

  /**
   * Sends a buy order to Binance for a desired base asset amount.
   * @param amount
   * @returns Promise<IBinanceOrderExecutionResponse>
   * @throws
   * - 12500: if the HTTP response code is not in the acceptedCodes
   * - 13506: if the response is not a valid payload object
   */
  const buy = (amount: number): Promise<IBinanceOrderExecutionResponse> => __order('BUY', amount);

  /**
   * Sends a sell order to Binance for a desired base asset amount.
   * @param amount
   * @returns Promise<IBinanceOrderExecutionResponse>
   * @throws
   * - 12500: if the HTTP response code is not in the acceptedCodes
   * - 13506: if the response is not a valid payload object
   */
  const sell = (amount: number): Promise<IBinanceOrderExecutionResponse> => __order('SELL', amount);

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
    listTrades,

    // account actions
    buy,
    sell,
  });
};

/* ************************************************************************************************
 *                                        GLOBAL INSTANCE                                         *
 ************************************************************************************************ */
const BinanceService = binanceServiceFactory();

/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export { BinanceService };
