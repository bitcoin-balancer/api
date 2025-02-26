/* eslint-disable no-console */
import { encodeError } from 'error-message-utils';
import { isArrayValid } from 'web-utils-kit';
import { IRequestResponse } from 'fetch-request-node';
import { validateResponse } from '../validations.js';

/* ************************************************************************************************
 *                                         IMPLEMENTATION                                         *
 ************************************************************************************************ */

/**
 * Ensures the candlestick's endpoint returned a valid list of candlesticks.
 * @param res
 * @throws
 * - 12500: if the HTTP response code is not in the acceptedCodes
 * - 14500: if the response doesn't include a valid series of candlesticks
 */
const validateCandlesticksResponse = <T>(res: IRequestResponse<T>): void => {
  validateResponse(res);
  if (!isArrayValid(res.data)) {
    console.log(res);
    throw new Error(encodeError('Bitfinex returned an invalid list of candlesticks.', 14500));
  }
};

/**
 * Ensures the Bitfinex API returned a valid order book object.
 * @param res
 * @throws
 * - 12500: if the HTTP response code is not in the acceptedCodes
 * - 14502: if the response does not include a valid order book snapshot
 */
const validateOrderBookResponse = <T>(res: IRequestResponse<T>): void => {
  validateResponse(res);
  if (!isArrayValid(res.data)) {
    console.log(res);
    throw new Error(encodeError('Bitfinex returned an invalid order book snapshot.', 14502));
  }
};

/**
 * Ensures the ticker's endpoint returned a valid list of tickers.
 * @param res
 * @throws
 * - 12500: if the HTTP response code is not in the acceptedCodes
 * - 14501: if the response doesn't include a valid series of tickers
 */
const validateTickersResponse = <T>(res: IRequestResponse<T>): void => {
  validateResponse(res);
  if (!isArrayValid(res.data)) {
    console.log(res);
    throw new Error(encodeError('Bitfinex returned an invalid list of tickers.', 14501));
  }
};





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  validateCandlesticksResponse,
  validateOrderBookResponse,
  validateTickersResponse,
};
