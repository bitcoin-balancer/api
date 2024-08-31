/* eslint-disable no-console */
import { encodeError } from 'error-message-utils';
import { IRequestResponse } from 'fetch-request-node';
import { arrayValid, objectValid } from '../../validations/index.js';
import { validateResponse } from '../validations.js';

/* ************************************************************************************************
 *                                         IMPLEMENTATION                                         *
 ************************************************************************************************ */

/**
 * Ensures the candlestick's endpoint returned a valid list of candlesticks.
 * @param res
 * @throws
 * - 12500: if the HTTP response code is not in the acceptedCodes
 * - 13500: if the response doesn't include a valid series of candlesticks
 */
const validateCandlesticksResponse = (res: IRequestResponse): void => {
  validateResponse(res);
  if (!arrayValid(res.data)) {
    console.log(res);
    throw new Error(encodeError('Binance returned an invalid list of candlesticks.', 13500));
  }
};

/**
 * Ensures the ticker's endpoint returned a valid list of tickers.
 * @param res
 * @throws
 * - 12500: if the HTTP response code is not in the acceptedCodes
 * - 13501: if the response doesn't include a valid series of tickers
 */
const validateTickersResponse = (res: IRequestResponse): void => {
  validateResponse(res);
  if (!arrayValid(res.data)) {
    console.log(res);
    throw new Error(encodeError('Binance returned an invalid list of tickers.', 13501));
  }
};

/**
 * Ensures the Binance API returned a valid order book object.
 * @param res
 * @throws
 * - 12500: if the HTTP response code is not in the acceptedCodes
 * - 13502: if the order book object is invalid
 */
const validateOrderBookResponse = (res: IRequestResponse): void => {
  validateResponse(res);
  if (!objectValid(res.data)) {
    console.log(res.data);
    throw new Error(encodeError('Binance returned an invalid order book object.', 13502));
  }
  if (!arrayValid(res.data.asks)) {
    console.log(res.data);
    throw new Error(encodeError('Binance returned an invalid order book object. The \'asks\' property is not a valid array of tuples.', 13502));
  }
  if (!arrayValid(res.data.bids)) {
    console.log(res.data);
    throw new Error(encodeError('Binance returned an invalid order book object. The \'bids\' property is not a valid array of tuples.', 13502));
  }
};





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  validateCandlesticksResponse,
  validateTickersResponse,
  validateOrderBookResponse,
};
