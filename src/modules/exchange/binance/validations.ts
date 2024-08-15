/* eslint-disable no-console */
import { encodeError } from 'error-message-utils';
import { IRequestResponse } from 'fetch-request-node';
import { objectValid, stringValid } from '../../shared/validations/index.js';

/* ************************************************************************************************
 *                                            HELPERS                                             *
 ************************************************************************************************ */

/**
 * Attempts to extract the error payload from an unsuccessful request.
 * @param payload
 * @returns string
 */
const __extractErrorPayload = (payload: unknown): string => {
  if (stringValid(payload, 1)) {
    return payload;
  }
  if (objectValid(payload)) {
    if (objectValid(payload.data)) {
      return typeof payload.data.msg === 'string'
        ? `Error Payload: ${payload.data.msg} (${payload.data.code ?? -1})`
        : `Error Payload: ${JSON.stringify(payload.data)}`;
    }
    return `Error Payload: ${JSON.stringify(payload)}`;
  }
  return 'Error Payload: unknown (-1)';
};

/**
 * Verifies the validity of a response object. If invalid, it will attempt to extract the error data
 * sent back.
 * @param res
 * @param acceptedCodes?
 * @throws
 * - 13500: if the HTTP response code is not in the acceptedCodes
 */
const __validateResponse = (res: IRequestResponse, acceptedCodes: number[] = [200]): void => {
  if (!acceptedCodes.includes(res.code)) {
    console.log(res);
    throw new Error(encodeError(`Binance returned an invalid HTTP response code '${res.code}'. ${__extractErrorPayload(res.data)}`, 13500));
  }
};





/* ************************************************************************************************
 *                                         IMPLEMENTATION                                         *
 ************************************************************************************************ */

/**
 * Ensures the candlestick's endpoint returned a valid list of candlesticks.
 * @param res
 * @throws
 * - 13500: if the HTTP response code is not in the acceptedCodes
 * - 13501: if the response doesn't include a valid series of candlesticks
 */
const validateCandlesticksResponse = (res: IRequestResponse): void => {
  __validateResponse(res);
  if (!Array.isArray(res.data) || !res.data.length) {
    console.log(res);
    throw new Error(encodeError('Binance returned an invalid list of candlesticks.', 13501));
  }
};





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  validateCandlesticksResponse,
};
