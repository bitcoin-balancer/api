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
} from '../types.js';
import {
  buildGetCandlesticksURL,
  buildSubscriptionForOrderBook,
  isOrderBookWebSocketMessage,
  tickersSortFunc,
  buildSubscriptionForTicker,
  buildTopPairsObject,
  buildWhitelist,
  isTickerWebsocketMessage,
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
  IBitfinexService,
  ISupportedCandlestickIntervals,
  IBitfinexWebSocketMessage,
  IBitfinexOrderBookLevel,
  IBitfinexCoinTicker,
} from './types.js';


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
  const __SYMBOL = `t${ENVIRONMENT.EXCHANGE_CONFIGURATION.baseAsset}USD`;

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
   * Candlesticks
   */

  /**
   * Retrieves the candlestick records from Binance's API.
   * @param interval
   * @param limit
   * @param startTime?
   * @throws
   * - 12500: if the HTTP response code is not in the acceptedCodes
   * - 14500: if the response doesn't include a valid series of candlesticks
   */
  const getCandlesticks = async (
    interval: ICandlestickInterval,
    limit: number,
    startTime?: number,
  ): Promise<ICompactCandlestickRecords> => {
    const res = await sendGET(
      buildGetCandlesticksURL(__SYMBOL, __CANDLESTICK_INTERVALS[interval], limit, startTime),
      { skipStatusCodeValidation: true },
    );
    validateCandlesticksResponse(res);
    return transformCandlesticks(res.data);
  };

  /**
   * Order Book
   */

  /**
   * Retrieves the current state of Bitfinex's order book for the base asset.
   * @returns Promise<IOrderBook>
   * @throws
   * - 12500: if the HTTP response code is not in the acceptedCodes
   * - 14502: if the response does not include a valid order book snapshot
   */
  const getOrderBook = async (): Promise<IOrderBook> => {
    const res = await sendGET(
      `https://api-pub.bitfinex.com/v2/book/${__SYMBOL}/P0?len=250`,
      { skipStatusCodeValidation: true },
    );
    validateOrderBookResponse(res);
    return transformOrderBook(res.data);
  };

  /**
   * Retrieves the order book' stream for the base asset.
   * @returns Observable<IOrderBookWebSocketMessage>
   */
  const getOrderBookStream = (): Observable<IOrderBookWebSocketMessage> => (
    new Observable<IOrderBookWebSocketMessage>((subscriber) => {
      const ws = websocketFactory<IBitfinexWebSocketMessage>(
        'LIQUIDITY',
        'wss://api-pub.bitfinex.com/ws/2',

        /**
         * onMessage: handle messages appropriately:
         * - if the msg is an array and the second item is a tuple, it is an update
         */
        (msg) => {
          if (isOrderBookWebSocketMessage(msg)) {
            subscriber.next(transformOrderBookMessage(msg[1] as IBitfinexOrderBookLevel));
          }
        },

        // onOpen: subscribe to the stream
        (__ws) => __ws.send(buildSubscriptionForOrderBook(__SYMBOL)),
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
   * Retrieves the dollar-based tickers ordered by volume descendingly from Bitfinex's API.
   * @returns Promise<IBitfinexCoinTicker[]>
   * @throws
   * - 12500: if the HTTP response code is not in the acceptedCodes
   * - 14501: if the response doesn't include a valid series of tickers
   */
  const __getTickers = async (): Promise<IBitfinexCoinTicker[]> => {
    const res = await sendGET(
      'https://api-pub.bitfinex.com/v2/tickers?symbols=ALL',
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
   * - 14501: if the response doesn't include a valid series of tickers
   */
  const getTopSymbols = async (whitelistedSymbols: string[], limit: number): Promise<string[]> => {
    // init values
    const whitelist = buildWhitelist(whitelistedSymbols, 'USD');
    const coins = [];

    // retrieve the tickers
    const tickers = await __getTickers();

    // iterate until the optimal number of coins have been selected
    let i = 0;
    while (i < tickers.length && coins.length < limit) {
      if (whitelist[tickers[i][0]]) {
        coins.push(whitelist[tickers[i][0]]);
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
      // init values
      const topPairs = buildTopPairsObject(topSymbols, 'USD');
      const channels: { [id: string]: string } = {};

      // instantiate the websocket
      const ws = websocketFactory<IBitfinexWebSocketMessage>(
        'COINS',
        'wss://api-pub.bitfinex.com/ws/2',

        /**
         * onMessage: handle messages appropriately:
         * - if the msg is an array and the second item is a tuple, it is a ticker
         * - if the msg's event is 'subscribed', a connection to a symbol has been established
         */
        (msg) => {
          if (msg) {
            if (Array.isArray(msg)) {
              if (isTickerWebsocketMessage(msg[1])) {
                subscriber.next(transformTicker(channels[msg[0]], msg[1]));
              }
            } else if (msg.event === 'subscribed') {
              channels[msg.chanId] = topPairs[msg.symbol];
            }
          }
        },

        // onOpen: subscribe to every symbol's stream
        (__ws) => Object.keys(topPairs).forEach(
          (symbol) => __ws.send(buildSubscriptionForTicker(symbol)),
        ),
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
const BitfinexService = bitfinexServiceFactory();





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  BitfinexService,
};
