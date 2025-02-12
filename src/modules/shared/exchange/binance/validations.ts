/* eslint-disable no-console */
import { encodeError } from 'error-message-utils';
import { isArrayValid, isObjectValid } from 'web-utils-kit';
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
 * - 13500: if the response doesn't include a valid series of candlesticks
 */
const validateCandlesticksResponse = <T>(res: IRequestResponse<T>): void => {
  validateResponse(res);
  if (!isArrayValid(res.data)) {
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
const validateTickersResponse = <T>(res: IRequestResponse<T>): void => {
  validateResponse(res);
  if (!isArrayValid(res.data)) {
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
const validateOrderBookResponse = <T>(res: IRequestResponse<T>): void => {
  validateResponse(res);
  if (!isObjectValid(res.data)) {
    console.log(res.data);
    throw new Error(encodeError('Binance returned an invalid order book object.', 13502));
  }
  if (!isArrayValid(res.data.asks)) {
    console.log(res.data);
    throw new Error(encodeError('Binance returned an invalid order book object. The \'asks\' property is not a valid array of tuples.', 13502));
  }
  if (!isArrayValid(res.data.bids)) {
    console.log(res.data);
    throw new Error(encodeError('Binance returned an invalid order book object. The \'bids\' property is not a valid array of tuples.', 13502));
  }
};

/**
 * Ensures the account information's endpoint returned a valid list of balances.
 * @param res
 * @throws
 * - 12500: if the HTTP response code is not in the acceptedCodes
 * - 13503: if the response didn't include a valid object
 * - 13504: if the response didn't include a valid list of balances
 */
const validateBalancesResponse = <T>(res: IRequestResponse<T>): void => {
  validateResponse(res);
  if (!isObjectValid(res.data)) {
    console.log(res);
    throw new Error(encodeError('Binance returned an invalid account information object.', 13503));
  }
  if (!isArrayValid(res.data.balances)) {
    console.log(res.data);
    throw new Error(encodeError('Binance returned an invalid list of balances.', 13504));
  }
};

/**
 * Ensures the trade's endpoint returned a valid list of executed trades.
 * @param res
 * @throws
 * - 12500: if the HTTP response code is not in the acceptedCodes
 * - 13505: if the response is not an array
 */
const validateTradesResponse = <T>(res: IRequestResponse<T>): void => {
  validateResponse(res);
  if (!isArrayValid(res.data, true)) {
    console.log(res);
    throw new Error(encodeError('Binance returned an invalid list of trades.', 13505));
  }
};

/**
 * Ensures the order's endpoint returned a valid execution payload object.
 * @param res
 * @throws
 * - 12500: if the HTTP response code is not in the acceptedCodes
 * - 13506: if the response is not a valid payload object
 */
const validateOrderExecutionResponse = <T>(res: IRequestResponse<T>): void => {
  validateResponse(res);
  if (!isObjectValid(res.data)) {
    console.log(res);
    throw new Error(encodeError('Binance returned an invalid order execution payload.', 13506));
  }
};





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  validateCandlesticksResponse,
  validateTickersResponse,
  validateOrderBookResponse,
  validateBalancesResponse,
  validateTradesResponse,
  validateOrderExecutionResponse,
};
