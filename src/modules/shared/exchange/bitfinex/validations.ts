/* eslint-disable no-console */
import { encodeError } from 'error-message-utils';
import { IRequestResponse } from 'fetch-request-node';
import { arrayValid } from '../../validations/index.js';
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
const validateCandlesticksResponse = (res: IRequestResponse): void => {
  validateResponse(res);
  if (!arrayValid(res.data)) {
    console.log(res);
    throw new Error(encodeError('Bitfinex returned an invalid list of candlesticks.', 14500));
  }
};





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  validateCandlesticksResponse,
};