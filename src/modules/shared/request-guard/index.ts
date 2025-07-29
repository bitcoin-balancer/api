import { encodeError } from 'error-message-utils';
import { ENVIRONMENT } from '../environment/index.js';
import { APIService } from '../api/index.js';
import { IAuthority, UserService } from '../../auth/user/index.js';
import { JWTService } from '../../auth/jwt/index.js';
import { IPBlacklistService } from '../../ip-blacklist/index.js';
import { extractAccessJWT } from './utils.js';
import { validateArgs, validateAuthorizationHeader, validateIP } from './validations.js';

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
 * - 6250: if the IP's format is invalid
 * - 5000: if the IP Address is in the blacklist
 * - 6251: if there are required args but the args object is invalid or empty
 * - 6252: if an argument is required but wasn't included in the request args (body|query)
 */
const checkPublicRequest = (
  clientIP: string | undefined,
  requiredArgs?: string[],
  args?: Record<string, any>,
): void => {
  // ensure the API is not running on TEST_MODE
  if (ENVIRONMENT.TEST_MODE) {
    throw new Error(encodeError('The API cannot accept requests when TEST_MODE is enabled.', 6000));
  }

  // ensure the API is not running on RESTORE_MODE
  if (ENVIRONMENT.RESTORE_MODE) {
    throw new Error(
      encodeError('The API cannot accept requests when RESTORE_MODE is enabled.', 6001),
    );
  }

  // ensure the API has been initialized
  if (!APIService.initialized) {
    throw new Error(
      encodeError(
        'The API cannot accept requests because it has not yet been initialized. Please try again in a few minutes.',
        6002,
      ),
    );
  }

  // ensure the IP Address is valid and is not Blacklisted
  validateIP(clientIP);
  IPBlacklistService.isBlacklisted(<string>clientIP);

  // validate the arguments
  validateArgs(requiredArgs, args);
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
 * - 6251: if there are required args but the args object is invalid or empty
 * - 6252: if an argument is required but wasn't included in the request args (body|query)
 * - 6253: if the authorization header has an invalid format or doesn't exist
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
  args?: Record<string, any>,
  otpToken?: string,
): Promise<string> => {
  // perform the essential validations
  checkPublicRequest(clientIP, requiredArgs, args);

  // decode the authorization
  validateAuthorizationHeader(authorization);
  const uid = await JWTService.verifyAccessToken(extractAccessJWT(<string>authorization));

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
export { checkPublicRequest, checkRequest };
