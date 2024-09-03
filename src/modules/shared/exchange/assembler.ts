import { ENVIRONMENT } from '../environment/index.js';
import { BinanceService } from './binance/index.js';
import { BitfinexService } from './bitfinex/index.js';
import { KrakenService } from './kraken/index.js';
import {
  IGetCandlesticks,
  IGetOrderBook,
  IGetOrderBookStream,
  IGetTopSymbols,
  IGetTickersStream,
} from './types.js';

/* ************************************************************************************************
 *                                          MARKET DATA                                           *
 ************************************************************************************************ */

/**
 * Assembles the getCandlesticks method based on the configuration set in the environment.
 * @returns IGetCandlesticks
 */
const assembleGetCandlesticks = (): IGetCandlesticks => {
  switch (ENVIRONMENT.EXCHANGE_CONFIGURATION.window) {
    case 'binance':
      return BinanceService.getCandlesticks;
    case 'bitfinex':
      return BitfinexService.getCandlesticks;
    case 'kraken':
      return KrakenService.getCandlesticks;
    default:
      throw new Error(`The function assembleGetCandlesticks could not be assembled because the exchange '${ENVIRONMENT.EXCHANGE_CONFIGURATION.window}' is not supported.`);
  }
};

/**
 * Assembles the getOrderBook method based on the configuration set in the environment.
 * @returns IGetOrderBook
 */
const assembleGetOrderBook = (): IGetOrderBook => {
  switch (ENVIRONMENT.EXCHANGE_CONFIGURATION.liquidity) {
    case 'binance':
      return BinanceService.getOrderBook;
    case 'bitfinex':
      return BitfinexService.getOrderBook;
    default:
      throw new Error(`The function assembleGetOrderBook could not be assembled because the exchange '${ENVIRONMENT.EXCHANGE_CONFIGURATION.liquidity}' is not supported.`);
  }
};

/**
 * Assembles the assembleGetOrderBookStream method based on the configuration set in the environment
 * @returns IGetOrderBookStream
 */
const assembleGetOrderBookStream = (): IGetOrderBookStream => {
  switch (ENVIRONMENT.EXCHANGE_CONFIGURATION.liquidity) {
    case 'binance':
      return BinanceService.getOrderBookStream;
    default:
      throw new Error(`The function assembleGetOrderBookStream could not be assembled because the exchange '${ENVIRONMENT.EXCHANGE_CONFIGURATION.liquidity}' is not supported.`);
  }
};

/**
 * Assembles the getTopSymbols method based on the configuration set in the environment.
 * @returns IGetTopSymbols
 */
const assembleGetTopSymbols = (): IGetTopSymbols => {
  switch (ENVIRONMENT.EXCHANGE_CONFIGURATION.coins) {
    case 'binance':
      return BinanceService.getTopSymbols;
    case 'bitfinex':
      return BitfinexService.getTopSymbols;
    case 'kraken':
      return KrakenService.getTopSymbols;
    default:
      throw new Error(`The function assembleGetTopSymbols could not be assembled because the exchange '${ENVIRONMENT.EXCHANGE_CONFIGURATION.coins}' is not supported.`);
  }
};

/**
 * Assembles the getTickersStream method based on the configuration set in the environment.
 * @returns IGetTickersStream
 */
const assembleGetTickersStream = (): IGetTickersStream => {
  switch (ENVIRONMENT.EXCHANGE_CONFIGURATION.coins) {
    case 'binance':
      return BinanceService.getTickersStream;
    case 'bitfinex':
      return BitfinexService.getTickersStream;
    case 'kraken':
      return KrakenService.getTickersStream;
    default:
      throw new Error(`The function assembleGetTickersStream could not be assembled because the exchange '${ENVIRONMENT.EXCHANGE_CONFIGURATION.coins}' is not supported.`);
  }
};





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  // market data
  assembleGetCandlesticks,
  assembleGetOrderBook,
  assembleGetOrderBookStream,
  assembleGetTopSymbols,
  assembleGetTickersStream,
};
