import { Observable } from 'rxjs';
import { sendGET } from 'fetch-request-node';
import { ENVIRONMENT } from '../../environment/index.js';
import { ICompactCandlestickRecords } from '../../candlestick/index.js';
import { ICandlestickInterval, ITickerWebSocketMessage } from '../types.js';
import { websocketFactory } from '../../websocket/index.js';
import {
  buildGetCandlesticksURL,
  buildWhitelist,
  tickersSortFunc,
  buildTopPairsObject,
} from './utils.js';
import { validateCandlesticksResponse, validateTickersResponse } from './validations.js';
import { transformCandlesticks, transformTickers } from './transformers.js';
import { IBinanceService, IBinanceCoinTicker, IBinanceTickerWebSocketMessage } from './types.js';

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
    // send and validate the req
    const res = await sendGET(
      buildGetCandlesticksURL(__SYMBOL, interval, limit, startTime),
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
const BinanceService = binanceServiceFactory();





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  BinanceService,
};
