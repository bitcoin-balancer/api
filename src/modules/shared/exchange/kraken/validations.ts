/* eslint-disable no-console */
import { encodeError } from 'error-message-utils';
import { isArrayValid, isObjectValid } from 'web-utils-kit';
import { IRequestResponse } from 'fetch-request-node';
import { validateResponse } from '../validations.js';
import { IKrakenAPIResponse } from './types.js';

/* ************************************************************************************************
 *                                         IMPLEMENTATION                                         *
 ************************************************************************************************ */

/**
 * Validates the response object returned by the Kraken API.
 * @param res
 * @throws
 * - 15500: if the response is not an object or it is missing the error property
 * - 15501: if the response contains errors
 * - 15502: if the response does not contain a valid result property
 */
const validateAPIResponse = (res: IKrakenAPIResponse): void => {
  if (!isObjectValid(res) || !isArrayValid(res.error, true)) {
    console.log(res);
    throw new Error(encodeError('The Kraken API returned an invalid response object.', 15500));
  }
  if (res.error.length > 0) {
    throw new Error(encodeError(`The Kraken API returned the following errors: ${res.error.join(' | ')}.`, 15501));
  }
  if (!isObjectValid(res.result)) {
    console.log(res);
    throw new Error(encodeError('The Kraken API returned a response object with an invalid \'result\' property.', 15502));
  }
};

/**
 * Ensures the candlestick's endpoint returned a valid list of candlesticks.
 * @param res
 * @param resultKey
 * @throws
 * - 12500: if the HTTP response code is not in the acceptedCodes
 * - 15500: if the response is not an object or it is missing the error property
 * - 15501: if the response contains errors
 * - 15502: if the response does not contain a valid result property
 * - 15503: if the response doesn't include a valid series of candlesticks
 */
const validateCandlesticksResponse = (res: IRequestResponse, resultKey: string): void => {
  validateResponse(res);
  validateAPIResponse(res.data);
  if (!isArrayValid(res.data.result[resultKey])) {
    console.log(res);
    throw new Error(encodeError('Kraken returned an invalid list of candlesticks.', 15503));
  }
};

/**
 * Ensures the order book's endpoint returned a valid object.
 * @param res
 * @param resultKey
 * @throws
 * - 12500: if the HTTP response code is not in the acceptedCodes
 * - 15500: if the response is not an object or it is missing the error property
 * - 15501: if the response contains errors
 * - 15502: if the response does not contain a valid result property
 * - 15505: if the response doesn't include a valid order book object
 */
const validateOrderBookResponse = (res: IRequestResponse, resultKey: string): void => {
  validateResponse(res);
  validateAPIResponse(res.data);
  if (!isObjectValid(res.data.result[resultKey])) {
    console.log(res);
    throw new Error(encodeError('Kraken returned an invalid order book object.', 15505));
  }
  if (!isArrayValid(res.data.result[resultKey].asks)) {
    console.log(res);
    throw new Error(encodeError('Kraken returned an invalid order book object. The \'asks\' property is not a valid list.', 15505));
  }
  if (!isArrayValid(res.data.result[resultKey].bids)) {
    console.log(res);
    throw new Error(encodeError('Kraken returned an invalid order book object. The \'bids\' property is not a valid list.', 15505));
  }
};

/**
 * Ensures the ticker's endpoint returned a valid list of tickers.
 * @param res
 * @throws
 * - 12500: if the HTTP response code is not in the acceptedCodes
 * - 15500: if the response is not an object or it is missing the error property
 * - 15501: if the response contains errors
 * - 15502: if the response does not contain a valid result property
 * - 15504: if the response doesn't include a valid series of tickers
 */
const validateTickersResponse = (res: IRequestResponse): void => {
  validateResponse(res);
  validateAPIResponse(res.data);
  if (!isArrayValid(Object.keys(res.data.result))) {
    console.log(res);
    throw new Error(encodeError('Kraken returned an invalid list of tickers.', 15504));
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
