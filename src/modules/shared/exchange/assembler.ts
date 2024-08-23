import { ENVIRONMENT } from '../environment/index.js';
import { BinanceService } from './binance/index.js';
import { BitfinexService } from './bitfinex/index.js';
import { KrakenService } from './kraken/index.js';
import { IGetCandlesticks, IGetTopCoins } from './types.js';

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
 * Assembles the getTopCoins method based on the configuration set in the environment.
 * @returns IGetTopCoins
 */
const assembleGetTopCoins = (): IGetTopCoins => {
  switch (ENVIRONMENT.EXCHANGE_CONFIGURATION.coins) {
    case 'binance':
      return BinanceService.getTopCoins;
    default:
      throw new Error(`The function assembleGetTopCoins could not be assembled because the exchange '${ENVIRONMENT.EXCHANGE_CONFIGURATION.coins}' is not supported.`);
  }
};





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  // market data
  assembleGetCandlesticks,
  assembleGetTopCoins,
};
