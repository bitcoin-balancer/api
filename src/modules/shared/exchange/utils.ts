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





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  extractErrorPayload,
};
