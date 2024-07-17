

/* ************************************************************************************************
 *                                         IMPLEMENTATION                                         *
 ************************************************************************************************ */

/**
 * Validates and extracts the Access JWT from the authorization header.
 * @param authorization
 * @returns string
 * @throws
 * - 6253: if the authorization header has an invalid format or doesn't exist
 */
const extractAccessJWT = (authorization: string): string => authorization.split('Bearer ')[1];





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  extractAccessJWT,
};
