import { isStringValid, isObjectValid, isArrayValid } from 'web-utils-kit';

/* ************************************************************************************************
 *                                            HELPERS                                             *
 ************************************************************************************************ */

/**
 * Checks if an error payload was returned by the Binance API.
 * @param payload
 * @returns boolean
 */
const __isBinanceError = (payload: Record<string, any>): boolean => typeof payload.msg === 'string';

/**
 * Checks if an error payload was returned by the Bitfinex API.
 * @param payload
 * @returns boolean
 */
const __isBitfinexError = (payload: any[]): boolean => (
  payload[0] === 'error'
  && typeof payload[1] === 'number'
  && typeof payload[2] === 'string'
);





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
  if (isStringValid(payload, 1)) {
    return `Error Payload: ${payload}`;
  }
  if (isObjectValid(payload)) {
    // binance error payload - e.g. { "code": -1120, "msg": "Invalid interval." }
    if (__isBinanceError(payload)) {
      return `Error Payload: ${payload.msg} (${payload.code ?? -1})`;
    }

    // kraken error payload
    // ...
  }
  if (isArrayValid(payload)) {
    // bitfinex error payload - e.g. ["error", 10020, "limit: invalid"]
    if (__isBitfinexError(payload)) {
      return `Error Payload: ${payload[2]} (${payload[1]})`;
    }
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
