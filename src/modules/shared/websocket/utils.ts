import { Buffer } from 'node:buffer';

/* ************************************************************************************************
 *                                         IMPLEMENTATION                                         *
 ************************************************************************************************ */

/**
 * When the connection is closed by the origin, a code and a reason are issued. This function
 * converts it into a readable string.
 * @param code
 * @param reason
 * @returns string
 */
const formatConnectionClosePayload = (code: unknown, reason: unknown): string => (
  `Code: ${typeof code === 'number' ? code : 'unknown'} - Reason: ${Buffer.isBuffer(reason) ? reason.toString() : 'unknown'}`
);

/**
 * Checks if the connection's idle limit has been exceeded.
 * @param lastMessage
 * @param limit
 * @returns boolean
 */
const exceededIdleLimit = (
  lastMessage: number | undefined,
  limit: number,
): boolean => typeof lastMessage !== 'number' || (Date.now() - (limit * 1000)) > lastMessage;





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  formatConnectionClosePayload,
  exceededIdleLimit,
};
