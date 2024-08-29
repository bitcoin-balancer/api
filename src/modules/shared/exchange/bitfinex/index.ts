import { Observable } from 'rxjs';
import { sendGET } from 'fetch-request-node';
import { ENVIRONMENT } from '../../environment/index.js';
import { ICompactCandlestickRecords } from '../../candlestick/index.js';
import { websocketFactory } from '../../websocket/index.js';
import { ICandlestickInterval, ITickerWebSocketMessage } from '../types.js';
import {
  buildGetCandlesticksURL,
  buildSubscriptionForTicker,
  buildTopPairsObject,
  buildWhitelist,
  tickersSortFunc,
} from './utils.js';
import { validateCandlesticksResponse, validateTickersResponse } from './validations.js';
import { transformCandlesticks, transformTicker } from './transformers.js';
import {
  IBitfinexCoinTicker,
  IBitfinexService,
  IBitfinexWebSocketMessage,
  ISupportedCandlestickIntervals,
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
    // send and validate the req
    const res = await sendGET(
      buildGetCandlesticksURL(__SYMBOL, __CANDLESTICK_INTERVALS[interval], limit, startTime),
      { skipStatusCodeValidation: true },
    );
    validateCandlesticksResponse(res);

    // finally, return the transformed candlesticks
    return transformCandlesticks(res.data);
  };

  /**
   * Order Book
   */

  // ...

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
        (msg) => {
          // handle the message accordingly
          // - if the msg is an array and the second item is a tuple, it is a ticker
          // - if the msg's event is 'subscribed', a connection to a symbol has been established
          if (msg) {
            if (Array.isArray(msg)) {
              if (Array.isArray(msg[1])) {
                subscriber.next(transformTicker(channels[msg[0]], msg[1]));
              }
            } else if (msg.event === 'subscribed') {
              channels[msg.chanId] = topPairs[msg.symbol];
            }
          }
        },
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
