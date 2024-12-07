import jwt from 'jsonwebtoken';
import { encodeError, extractMessage } from 'error-message-utils';
import { isObjectValid, isJWTValid, isUUIDValid } from 'web-utils-kit';
import { toSeconds } from '../../shared/utils/index.js';

/* ************************************************************************************************
 *                                           CONSTANTS                                            *
 ************************************************************************************************ */

// the algorithm that will be used to sign the JWT
const ALG: jwt.Algorithm = 'HS256';





/* ************************************************************************************************
 *                                            HELPERS                                             *
 ************************************************************************************************ */

/**
 * Builds the payload that will be placed in the JWT and signed. The expiration is converted to
 * seconds in order to match the spec.
 * @param uid
 * @param expiry
 * @returns Record<string, string | number>
 */
const __buildPayload = (uid: string, expiry: Date): Record<string, string | number> => ({
  sub: uid,
  exp: toSeconds(expiry.getTime()),
});





/* ************************************************************************************************
 *                                         IMPLEMENTATION                                         *
 ************************************************************************************************ */

/**
 * Builds a JSON Web Token and signs it.
 * @param uid
 * @param expiry
 * @param secret
 * @returns Promise<string>
 * @throws
 * - 4250: if the jsonwebtoken lib fails to sign the token
 * - 4251: if the signed token has an invalid format
 */
const sign = (
  uid: string,
  expiry: Date,
  secret: string,
): Promise<string> => new Promise((resolve, reject) => {
  jwt.sign(__buildPayload(uid, expiry), secret, { algorithm: ALG }, (err, token) => {
    if (err) {
      reject(new Error(encodeError(`Failed to sign the JWT. Error: ${extractMessage(err)}`, 4250)));
    } else if (!isJWTValid(token)) {
      reject(new Error(encodeError(`The signed JWT '${token}' has an invalid format.`, 4251)));
    } else {
      resolve(token);
    }
  });
});

/**
 * Verifies a JWT, decodes its payload and returns it.
 * @param token
 * @param secret
 * @param ignoreExpiration?
 * @returns Promise<string>
 * @throws
 * - 4252: if the lib fails to verify the JWT for any reason (most likely is that the token expired)
 * - 4253: if the decoded data is an invalid object or does not contain the uid
 */
const verify = (
  token: string,
  secret: string,
  ignoreExpiration: boolean = false,
): Promise<string> => new Promise((resolve, reject) => {
  jwt.verify(token, secret, { algorithms: [ALG], ignoreExpiration }, (err, decodedData) => {
    if (err) {
      reject(new Error(encodeError(`Failed to verify the JWT. Error: ${extractMessage(err)}`, 4252)));
    } else if (!isObjectValid(decodedData) || !isUUIDValid(decodedData.sub, 4)) {
      reject(new Error(encodeError('The data decoded from the JWT is not a valid object or contains an invalid UUID.', 4253)));
    } else {
      resolve(decodedData.sub);
    }
  });
});





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  sign,
  verify,
};
