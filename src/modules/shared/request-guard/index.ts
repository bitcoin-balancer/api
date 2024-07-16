import { encodeError } from 'error-message-utils';
import { IRecord } from '../types.js';
import { authorizationHeaderValid, ipValid, objectValid } from '../validations/index.js';
import { ENVIRONMENT } from '../environment/index.js';
import { APIService } from '../api/index.js';
import { IAuthority, UserService } from '../../auth/user/index.js';
import { JWTService } from '../../auth/jwt/index.js';
import { IPBlacklistService } from '../../ip-blacklist/index.js';

/* ************************************************************************************************
 *                                            HELPERS                                             *
 ************************************************************************************************ */

/**
 * Validates the Client's IP format and also checks it against the Blacklist.
 * @param ip
 * @throws
 * - 6006: if the IP's format is invalid
 * - 5000: if the IP Address is in the blacklist
 */
const __validateIP = (ip: string | undefined): void => {
  if (!ipValid(ip)) {
    throw new Error(encodeError(`The request's IP Address '${ip}' is invalid and therefore cannot be served.`, 6006));
  }
  IPBlacklistService.isBlacklisted(ip);
};

/**
 * If there are required arguments, it will ensure the args object contains all the required keys.
 * @param requiredArgs
 * @param args
 * @throws
 * - 6003: if there are required args but the args object is invalid or empty
 * - 6004: if an argument is required but wasn't included in the request args (body|query)
 */
const __validateArgs = (
  requiredArgs: string[] | undefined,
  args: IRecord<any> | undefined,
): void => {
  if (Array.isArray(requiredArgs) && requiredArgs.length) {
    if (!objectValid(args)) {
      throw new Error(encodeError('The request cannot be served because the required arguments were not sent.', 6003));
    }
    requiredArgs.forEach((argKey) => {
      if (
        args[argKey] === undefined
        || args[argKey] === null
        || args[argKey] === ''
        || Number.isNaN(args[argKey])
      ) {
        throw new Error(encodeError(`The arg '${argKey}' is required but it was not sent in the request.`, 6004));
      }
    });
  }
};

/**
 * Validates and extracts the Access JWT from the authorization header.
 * @param authorization
 * @returns string
 * @throws
 * - 6005: if the authorization header has an invalid format or doesn't exist
 */
const __extractAccessJWT = (authorization: string | undefined): string => {
  if (!authorizationHeaderValid(authorization)) {
    throw new Error(encodeError('The Authorization Header is invalid. Please review the docs and try again.', 6005));
  }
  return authorization.split('Bearer ')[1];
};

/**
 * Extracts the Access JWT from the Authorization Header and attempts to verify it. If successful,
 * returns the uid.
 * @param authorization
 * @returns Promise<string>
 * @throws
 * - 6005: if the authorization header has an invalid format or doesn't exist
 * - 4252: if the lib fails to verify the JWT for any reason (most likely, the token expired)
 * - 4253: if the decoded data is an invalid object or does not contain the uid
 */
const __decodeAuthorizationHeader = async (authorization: string | undefined): Promise<string> => (
  JWTService.verifyAccessToken(__extractAccessJWT(authorization))
);





/* ************************************************************************************************
 *                                         IMPLEMENTATION                                         *
 ************************************************************************************************ */

/**
 * Verifies if the API is able to receive a public (non-authenticated) request.
 * @param clientIP
 * @param requiredArgs?
 * @param args?
 * @throws
 * - 6000: if TEST_MODE is enabled
 * - 6001: if RESTORE_MODE is enabled
 * - 6002: if the API has not finished the initialization process
 * - 6006: if the IP's format is invalid
 * - 5000: if the IP Address is in the blacklist
 * - 6003: if there are required args but the args object is invalid or empty
 * - 6004: if an argument is required but wasn't included in the request args (body|query)
 */
const checkPublicRequest = (
  clientIP: string | undefined,
  requiredArgs?: string[],
  args?: IRecord<any>,
): void => {
  // ensure the API is not running on TEST_MODE
  if (ENVIRONMENT.TEST_MODE) {
    throw new Error(encodeError('The API cannot accept requests when TEST_MODE is enabled.', 6000));
  }

  // ensure the API is not running on RESTORE_MODE
  if (ENVIRONMENT.RESTORE_MODE) {
    throw new Error(encodeError('The API cannot accept requests when RESTORE_MODE is enabled.', 6001));
  }

  // ensure the API has been initialized
  if (!APIService.initialized) {
    throw new Error(encodeError('The API cannot accept requests because it has not yet been initialized. Please try again in a few minutes.', 6002));
  }

  // ensure the IP Address is not Blacklisted
  __validateIP(clientIP);

  // validate the arguments
  __validateArgs(requiredArgs, args);
};

/**
 * Verifies if the API is able to receive an authenticated request.
 * @param authorization
 * @param clientIP
 * @param requiredAuthority
 * @param requiredArgs
 * @param args
 * @param otpToken
 * @returns Promise<void>
 * @throws
 * - 6000: if TEST_MODE is enabled
 * - 6001: if RESTORE_MODE is enabled
 * - 6002: if the API has not finished the initialization process
 * - 5000: if the IP Address is in the blacklist
 * - 6003: if there are required args but the args object is invalid or empty
 * - 6004: if an argument is required but wasn't included in the request args (body|query)
 * - 6005: if the authorization header has an invalid format or doesn't exist
 * - 4252: if the lib fails to verify the JWT for any reason (most likely, the token expired)
 * - 4253: if the decoded data is an invalid object or does not contain the uid
 * - 3001: if the uid is invalid or not present in the users' object
 * - 3002: if the user is not authorized to perform the action
 * - 3250: if the user record does not exist or the OTP Secret is not valid
 * - 3506: if the uid has an invalid format
 * - 3510: if the OTP Token has an invalid format
 * - 3000: if the OTP Token failed the verification
 */
const checkRequest = async (
  authorization: string | undefined,
  clientIP: string | undefined,
  requiredAuthority: IAuthority,
  requiredArgs?: string[],
  args?: IRecord<any>,
  otpToken?: string,
): Promise<string> => {
  // perform the essential validations
  checkPublicRequest(clientIP, requiredArgs, args);

  // decode the authorization
  const uid = await __decodeAuthorizationHeader(authorization);

  // verify the authority
  UserService.isAuthorized(uid, requiredAuthority);

  // verify the OTP Token
  if (typeof otpToken === 'string') {
    await UserService.verifyOTPToken(uid, otpToken);
  }

  // finally, return the decoded uid
  return uid;
};





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  checkPublicRequest,
  checkRequest,
};
