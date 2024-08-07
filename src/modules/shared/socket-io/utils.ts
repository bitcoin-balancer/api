import { signedCookie } from 'cookie-parser';
import { decodeError, encodeError } from 'error-message-utils';
import { ENVIRONMENT } from '../environment/index.js';
import { JWTService } from '../../auth/jwt/index.js';

/* ************************************************************************************************
 *                                         IMPLEMENTATION                                         *
 ************************************************************************************************ */

/**
 * Cleans and generates the URL-decoded Refresh JWT from the raw cookie.
 * @param cookie
 * @returns string
 */
const __decodeRefreshJWTCookie = (cookie: string): string => (
  decodeURIComponent(cookie.replace(`${JWTService.REFRESH_JWT_COOKIE_NAME}=`, ''))
);

/**
 * Extracts the Refresh JWT from the request's cookie and unsigns it.
 * @param cookie
 * @returns string
 * @throws
 * - 9250: if the auth cookie was not included in the headers
 * - 9251: if the signed refresh JWT could not be extracted from the cookie
 */
const extractRefreshJWT = (cookie: string | undefined): string => {
  if (typeof cookie !== 'string' || !cookie.length) {
    throw new Error(encodeError(`The socker's handshake doesn't contain cookies. Received: ${cookie}`, 9250));
  }
  const unsignedJWT = signedCookie(__decodeRefreshJWTCookie(cookie), ENVIRONMENT.COOKIE_SECRET);
  if (typeof unsignedJWT !== 'string') {
    throw new Error(encodeError(`The Refresh JWT could not be extracted from the signed cookie. Received: ${unsignedJWT}`, 9251));
  }
  return unsignedJWT;
};

/**
 * Verifies if an error during a connection should disconnect the socket. The possible triggers are:
 * - 9250: if the auth cookie was not included in the headers
 * - 9251: if the signed refresh JWT could not be extracted from the cookie
 * - 4252: if the lib fails to verify the JWT for any reason (most likely, the token expired)
 * - 4253: if the decoded data is an invalid object or does not contain the uid
 * @param error
 * @returns boolean
 */
const shouldDisconnect = (error: Error): boolean => {
  const { code } = decodeError(error);
  return (
    code === 9250
    || code === 9251
    || code === 4252
    || code === 4253
  );
};





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  extractRefreshJWT,
  shouldDisconnect,
};
