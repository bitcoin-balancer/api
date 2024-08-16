/* eslint-disable no-console */
import { encodeError } from 'error-message-utils';
import { IRequestResponse } from 'fetch-request-node';
import { extractErrorPayload } from './utils.js';

/* ************************************************************************************************
 *                                         IMPLEMENTATION                                         *
 ************************************************************************************************ */

/**
 * Verifies the validity of a response object. If invalid, it will attempt to extract the error data
 * sent back.
 * @param res
 * @param acceptedCodes?
 * @throws
 * - 12500: if the HTTP response code is not in the acceptedCodes
 */
const validateResponse = (res: IRequestResponse, acceptedCodes: number[] = [200]): void => {
  if (!acceptedCodes.includes(res.code)) {
    console.log(res);
    throw new Error(encodeError(`The exchange returned an invalid HTTP response code '${res.code}'. ${extractErrorPayload(res.data)}`, 12500));
  }
};





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  validateResponse,
};
