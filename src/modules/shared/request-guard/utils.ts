/* ************************************************************************************************
 *                                         IMPLEMENTATION                                         *
 ************************************************************************************************ */

/**
 * Validates and extracts the Access JWT from the authorization header.
 * @param authorization
 * @returns string
 */
const extractAccessJWT = (authorization: string): string => authorization.split('Bearer ')[1];

/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export { extractAccessJWT };
