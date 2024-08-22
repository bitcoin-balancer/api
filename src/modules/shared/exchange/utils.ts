import { objectValid, stringValid } from '../validations/index.js';

/* ************************************************************************************************
 *                                         IMPLEMENTATION                                         *
 ************************************************************************************************ */

/**
 * Attempts to extract the error payload from an unsuccessful request.
 * @param payload
 * @returns string
 */
const extractErrorPayload = (payload: unknown): string => {
  // if the payload is a string, return it right away
  if (stringValid(payload, 1)) {
    return `Error Payload: ${payload}`;
  }
  if (objectValid(payload)) {
    // binance error payload
    if (typeof payload.msg === 'string') {
      return `Error Payload: ${payload.msg} (${payload.code ?? -1})`;
    }

    // bitfinex error payload
    // the api returns an array like: ["error", 10020, "limit: invalid"] - no action is needed

    // kraken error payload
    // ...
  }

  // otherwise, stringify the whole payload
  return `Error Payload: ${JSON.stringify(payload)}`;
};





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  extractErrorPayload,
};
