import { encodeError } from 'error-message-utils';
import { isObjectValid, isArrayValid, isAuthorizationHeaderValid } from 'web-utils-kit';
import { isIPValid } from '../validations/index.js';

/* ************************************************************************************************
 *                                         IMPLEMENTATION                                         *
 ************************************************************************************************ */

/**
 * Validates the Client's IP format and also checks it against the Blacklist.
 * @param ip
 * @throws
 * - 6250: if the IP's format is invalid
 */
const validateIP = (ip: string | undefined): void => {
  if (!isIPValid(ip)) {
    throw new Error(encodeError(`The request's IP Address '${ip}' is invalid and therefore cannot be served.`, 6250));
  }
};

/**
 * If there are required arguments, it will ensure the args object contains all the required keys.
 * @param requiredArgs
 * @param args
 * @throws
 * - 6251: if there are required args but the args object is invalid or empty
 * - 6252: if an argument is required but wasn't included in the request args (body|query)
 */
const validateArgs = (
  requiredArgs: string[] | undefined,
  args: Record<string, any> | undefined,
): void => {
  if (isArrayValid(requiredArgs)) {
    if (!isObjectValid(args)) {
      throw new Error(encodeError('The request cannot be served because the required arguments were not sent.', 6251));
    }
    requiredArgs.forEach((argKey) => {
      if (
        args[argKey] === undefined
        || args[argKey] === null
        || args[argKey] === ''
        || Number.isNaN(args[argKey])
      ) {
        throw new Error(encodeError(`The arg '${argKey}' is required but it was not sent in the request.`, 6252));
      }
    });
  }
};

/**
 * Verifies if an authorization header was properly set on the request.
 * @param authorization
 * @throws
 * - 6253: if the authorization header is not present or has an invalid format
 */
const validateAuthorizationHeader = (authorization: string | undefined): void => {
  if (!isAuthorizationHeaderValid(authorization)) {
    throw new Error(encodeError('The Authorization Header is invalid. Please review the docs and try again.', 6253));
  }
};





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  validateIP,
  validateArgs,
  validateAuthorizationHeader,
};
