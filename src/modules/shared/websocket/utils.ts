import { Buffer } from 'node:buffer';
import { subSeconds } from 'date-fns';

/* ************************************************************************************************
 *                                         IMPLEMENTATION                                         *
 ************************************************************************************************ */

/**
 * Attempts to extract the reason why a Websocket connection was closed. If unable, it returns a
 * generic 'unknown' string.
 * @param reason
 * @returns string
 */
const __getConnectionCloseReason = (reason: unknown): string => {
  if (Buffer.isBuffer(reason)) {
    const reasonStr = reason.toString();
    if (reasonStr.length) {
      return reasonStr;
    }
  }
  return 'unknown.';
};

/**
 * When the connection is closed by the origin, a code and a reason are issued. This function
 * converts it into a readable string.
 * @param code
 * @param reason
 * @returns string
 */
const formatConnectionClosePayload = (code: unknown, reason: unknown): string =>
  `Code: ${typeof code === 'number' ? code : 'unknown'} - Reason: ${__getConnectionCloseReason(reason)}`;

/**
 * Checks if the connection's idle limit has been exceeded.
 * @param lastMessage
 * @param limit
 * @returns boolean
 */
const exceededIdleLimit = (lastMessage: number | undefined, limit: number): boolean =>
  typeof lastMessage !== 'number' || subSeconds(Date.now(), limit).getTime() > lastMessage;

/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export { formatConnectionClosePayload, exceededIdleLimit };
