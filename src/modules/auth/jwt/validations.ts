import { encodeError } from 'error-message-utils';
import { jwtValid, uuidValid } from '../../shared/validations/index.js';

/* ************************************************************************************************
 *                                         IMPLEMENTATION                                         *
 ************************************************************************************************ */

/**
 * Verifies if an access token can be refreshed based on the validity of the Refresh JWT.
 * @param decodedUID
 * @param retrievedUID
 * @throws
 * - 4502: if the Decoded UID is different to the one stored in the database
 */
const canRefreshAccessJWT = (decodedUID: string, retrievedUID: string): void => {
  if (decodedUID !== retrievedUID) {
    throw new Error(encodeError(`The UID decoded from the Refresh JWT '${decodedUID}' is different to the one stored in the database '${retrievedUID}'.`, 4502));
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
  canRefreshAccessJWT,
  canUserSignOut,
};
