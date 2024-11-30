import { encodeError } from 'error-message-utils';
import { jwtValid, uuidValid } from '../../shared/validations/index.js';

/* ************************************************************************************************
 *                                         IMPLEMENTATION                                         *
 ************************************************************************************************ */

/**
 * Verifies if the records can be listed for an uid.
 * @param uid
 * @throws
 * - 4500: if the uid has an invalid format
 */
const canRecordsBeListed = (uid: string): void => {
  if (!uuidValid(uid)) {
    throw new Error(encodeError(`The uid '${uid}' is invalid.`, 4500));
  }
};

/**
 * Verifies if an user has provided the correct details in order to sign out.
 * @param uid
 * @param refreshJWT
 * @throws
 * - 4500: if the uid has an invalid format
 * - 4501: if the Refresh JWT has an invalid format
 */
const canUserSignOut = (uid: string, refreshJWT: string): void => {
  if (!uuidValid(uid)) {
    throw new Error(encodeError(`The uid '${uid}' is invalid.`, 4500));
  }
  if (!jwtValid(refreshJWT)) {
    throw new Error(encodeError(`The refresh JWT '${refreshJWT}' is invalid.`, 4501));
  }
};





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  canRecordsBeListed,
  canUserSignOut,
};
