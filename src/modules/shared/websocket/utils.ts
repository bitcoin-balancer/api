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





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  formatConnectionClosePayload,
};
