import { encodeError } from 'error-message-utils';
import { IRecord } from '../types.js';
import { objectValid } from '../validations/index.js';
import { ENVIRONMENT } from '../environment/index.js';
import { APIService } from '../api/index.js';
import { IAuthority, UserService } from '../../auth/user/index.js';
import { IPBlacklistService } from '../../ip-blacklist/index.js';

/* ************************************************************************************************
 *                                            HELPERS                                             *
 ************************************************************************************************ */

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


const __validateAuthorizationHeader = (): void => {

};

const __decodeAuthorizationHeader = async (authorization: string): Promise<string> => '';




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
 * - 5000: if the IP Address is in the blacklist
 * - 6003: if there are required args but the args object is invalid or empty
 * - 6004: if an argument is required but wasn't included in the request args (body|query)
 */
const checkPublicRequest = (
  clientIP: string,
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
  IPBlacklistService.isBlacklisted(clientIP);

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
 */
const checkRequest = async (
  authorization: string,
  clientIP: string,
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
  // UserService.verifyOTPToken(uid, otpToken);

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
