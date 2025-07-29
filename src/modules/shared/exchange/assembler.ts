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
  IGetBalances,
  IListTrades,
  IBuy,
  ISell,
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
      throw new Error(
        `The function assembleGetCandlesticks could not be assembled because the exchange '${ENVIRONMENT.EXCHANGE_CONFIGURATION.window}' is not supported.`,
      );
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
    case 'kraken':
      return KrakenService.getOrderBook;
    default:
      throw new Error(
        `The function assembleGetOrderBook could not be assembled because the exchange '${ENVIRONMENT.EXCHANGE_CONFIGURATION.liquidity}' is not supported.`,
      );
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
    case 'bitfinex':
      return BitfinexService.getOrderBookStream;
    case 'kraken':
      return KrakenService.getOrderBookStream;
    default:
      throw new Error(
        `The function assembleGetOrderBookStream could not be assembled because the exchange '${ENVIRONMENT.EXCHANGE_CONFIGURATION.liquidity}' is not supported.`,
      );
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
      throw new Error(
        `The function assembleGetTopSymbols could not be assembled because the exchange '${ENVIRONMENT.EXCHANGE_CONFIGURATION.coins}' is not supported.`,
      );
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
      throw new Error(
        `The function assembleGetTickersStream could not be assembled because the exchange '${ENVIRONMENT.EXCHANGE_CONFIGURATION.coins}' is not supported.`,
      );
  }
};

/* ************************************************************************************************
 *                                         ACCOUNT DATA                                           *
 ************************************************************************************************ */

/**
 * Assembles the getBalances method based on the configuration set in the environment.
 * @returns IGetBalances
 */
const assembleGetBalances = (): IGetBalances => {
  switch (ENVIRONMENT.EXCHANGE_CONFIGURATION.trading) {
    case 'binance':
      return BinanceService.getBalances;
    default:
      throw new Error(
        `The function assembleGetBalances could not be assembled because the exchange '${ENVIRONMENT.EXCHANGE_CONFIGURATION.trading}' is not supported.`,
      );
  }
};

/**
 * Assembles the listTrades method based on the configuration set in the environment.
 * @returns IListTrades
 */
const assembleListTrades = (): IListTrades => {
  switch (ENVIRONMENT.EXCHANGE_CONFIGURATION.trading) {
    case 'binance':
      return BinanceService.listTrades;
    default:
      throw new Error(
        `The function assembleListTrades could not be assembled because the exchange '${ENVIRONMENT.EXCHANGE_CONFIGURATION.trading}' is not supported.`,
      );
  }
};

/* ************************************************************************************************
 *                                        ACCOUNT ACTIONS                                         *
 ************************************************************************************************ */

/**
 * Assembles the buy method based on the configuration set in the environment.
 * @returns IBuy
 */
const assembleBuy = (): IBuy => {
  switch (ENVIRONMENT.EXCHANGE_CONFIGURATION.trading) {
    case 'binance':
      return BinanceService.buy;
    default:
      throw new Error(
        `The function assembleBuy could not be assembled because the exchange '${ENVIRONMENT.EXCHANGE_CONFIGURATION.trading}' is not supported.`,
      );
  }
};

/**
 * Assembles the sell method based on the configuration set in the environment.
 * @returns ISell
 */
const assembleSell = (): ISell => {
  switch (ENVIRONMENT.EXCHANGE_CONFIGURATION.trading) {
    case 'binance':
      return BinanceService.sell;
    default:
      throw new Error(
        `The function assembleSell could not be assembled because the exchange '${ENVIRONMENT.EXCHANGE_CONFIGURATION.trading}' is not supported.`,
      );
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

  // account data
  assembleGetBalances,
  assembleListTrades,

  // account actions
  assembleBuy,
  assembleSell,
};
