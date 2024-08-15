import { ENVIRONMENT } from '../shared/environment/index.js';
import { BinanceService } from './binance/index.js';
import { IGetCandlesticks } from './types.js';

/* ************************************************************************************************
 *                                          MARKET DATA                                           *
 ************************************************************************************************ */

/**
 * Assembles the getCandlesticks method based on the configuration set in the environment.
 * @returns IGetCandlesticks
 */
const assembleGetCandlesticks = (): IGetCandlesticks => {
  switch (ENVIRONMENT.EXCHANGES_CONFIGURATION.window) {
    case 'binance':
      return BinanceService.getCandlesticks;
    default:
      throw new Error(`The function assembleGetCandlesticks could not be assembled because the exchange '${ENVIRONMENT.EXCHANGES_CONFIGURATION.window}' is not supported.`);
  }
};





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  // market data
  assembleGetCandlesticks,
};
