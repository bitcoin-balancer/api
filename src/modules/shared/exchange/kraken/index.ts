import { Observable } from 'rxjs';
import { sendGET } from 'fetch-request-node';
import { ICompactCandlestickRecords } from '../../candlestick/index.js';
import { websocketFactory } from '../../websocket/index.js';
import {
  ICandlestickInterval,
  IOrderBook,
  IOrderBookWebSocketMessage,
  ITickerWebSocketMessage,
} from '../types.js';
import {
  buildGetCandlesticksURL,
  buildSubscriptionForOrderBook,
  buildTopPairsObject,
  buildWhitelist,
  tickersSortFunc,
  buildSubscriptionForTickers,
} from './utils.js';
import {
  validateCandlesticksResponse,
  validateOrderBookResponse,
  validateTickersResponse,
} from './validations.js';
import {
  transformCandlesticks,
  transformOrderBook,
  transformOrderBookMessage,
  transformTicker,
} from './transformers.js';
import {
  IKrakenCoinTicker,
  IKrakenCoinTickers,
  IKrakenService,
  IKrakenWebSocketMessage,
  ISupportedCandlestickIntervals,
} from './types.js';

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
   * Candlesticks
   */

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
    const res = await sendGET(
      buildGetCandlesticksURL(__SYMBOL, __CANDLESTICK_INTERVALS[interval], startTime),
      { skipStatusCodeValidation: true },
    );
    validateCandlesticksResponse(res, 'XXBTZUSD');
    return transformCandlesticks(res.data.result.XXBTZUSD.slice(-(limit)));
  };

  /**
   * Order Book
   */

  /**
   * Retrieves the current state of Kraken's order book for the base asset.
   * @returns Promise<IOrderBook>
   * @throws
   * - 12500: if the HTTP response code is not in the acceptedCodes
   * - 15500: if the response is not an object or it is missing the error property
   * - 15501: if the response contains errors
   * - 15502: if the response does not contain a valid result property
   * - 15505: if the response doesn't include a valid order book object
   */
  const getOrderBook = async (): Promise<IOrderBook> => {
    const res = await sendGET(
      `https://api.kraken.com/0/public/Depth?pair=${__SYMBOL}&count=500`,
      { skipStatusCodeValidation: true },
    );
    validateOrderBookResponse(res, 'XXBTZUSD');
    return transformOrderBook(res.data.result.XXBTZUSD);
  };

  /**
   * Retrieves the order book's stream for the base asset.
   * @returns Observable<IOrderBookWebSocketMessage>
   */
  const getOrderBookStream = (): Observable<IOrderBookWebSocketMessage> => (
    new Observable<IOrderBookWebSocketMessage>((subscriber) => {
      const ws = websocketFactory<IKrakenWebSocketMessage>(
        'LIQUIDITY',
        'wss://ws.kraken.com/v2',

        // onMessage: emmit the data if the message is a book update
        (msg) => {
          if (msg && msg.channel === 'book') {
            subscriber.next(transformOrderBookMessage(msg.data[0]));
          }
        },

        // onOpen: subscribe to the order book's stream
        (__ws) => __ws.send(buildSubscriptionForOrderBook('BTC/USD')),
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
   * Retrieves the dollar-based tickers ordered by volume descendingly from Kraken's API.
   * @returns Promise<[string, IKrakenCoinTicker][]>
   * @throws
   * - 12500: if the HTTP response code is not in the acceptedCodes
   * - 15500: if the response is not an object or it is missing the error property
   * - 15501: if the response contains errors
   * - 15502: if the response does not contain a valid result property
   * - 15504: if the response doesn't include a valid series of tickers
   */
  const __getTickers = async (): Promise<[string, IKrakenCoinTicker][]> => {
    const res = await sendGET(
      'https://api.kraken.com/0/public/Ticker',
      { skipStatusCodeValidation: true },
    );
    validateTickersResponse(res);
    const tickers = Object.entries(<IKrakenCoinTickers>res.data.result);
    tickers.sort(tickersSortFunc);
    return tickers;
  };

  /**
   * Retrieves the top coins by trading volume based on a whitelist.
   * @param whitelistedSymbols
   * @param limit
   * @returns Promise<string[]>
   * @throws
   * - 12500: if the HTTP response code is not in the acceptedCodes
   * - 15500: if the response is not an object or it is missing the error property
   * - 15501: if the response contains errors
   * - 15502: if the response does not contain a valid result property
   * - 15504: if the response doesn't include a valid series of tickers
   */
  const getTopSymbols = async (whitelistedSymbols: string[], limit: number): Promise<string[]> => {
    // init values
    const whitelist = buildWhitelist(whitelistedSymbols);
    const coins = new Set<string>();

    // retrieve the tickers
    const tickers = await __getTickers();

    // iterate until the optimal number of coins have been selected
    let i = 0;
    while (i < tickers.length && coins.size < limit) {
      if (whitelist[tickers[i][0]]) {
        coins.add(whitelist[tickers[i][0]]);
      }
      i += 1;
    }

    // return only the top based on their volume
    return Array.from(coins).slice(0, limit);
  };

  /**
   * Retrieves the tickers' stream for a list of topSymbols.
   * @param topSymbols
   * @returns Observable<ITickerWebSocketMessage>
   */
  const getTickersStream = (topSymbols: string[]): Observable<ITickerWebSocketMessage> => (
    new Observable<ITickerWebSocketMessage>((subscriber) => {
      // init values
      const topPairs = buildTopPairsObject(topSymbols, 'USD');

      // instantiate the websocket
      const ws = websocketFactory<IKrakenWebSocketMessage>(
        'COINS',
        'wss://ws.kraken.com/v2',

        // onMessage: emmit the data if the message is a ticker update or snapshot
        (msg) => {
          if (msg && msg.channel === 'ticker') {
            subscriber.next(transformTicker(topPairs[msg.data[0].symbol], msg.data[0]));
          }
        },

        // onOpen: subscribe to every symbol's stream
        (__ws) => __ws.send(buildSubscriptionForTickers(Object.keys(topPairs))),
      );
      return function unsubscribe() {
        ws.off();
      };
    })
  );




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
