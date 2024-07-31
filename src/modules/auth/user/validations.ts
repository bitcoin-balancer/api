import { encodeError } from 'error-message-utils';
import {
  timestampValid,
  uuidValid,
  nicknameValid,
  authorityValid,
  passwordValid,
  otpTokenValid,
  integerValid,
} from '../../shared/validations/index.js';
import { AltchaService } from '../../altcha/index.js';
import { IAuthority } from './types.js';
import { isRoot } from './utils.js';
import { getUserRecord, nicknameExists } from './model.js';

/* ************************************************************************************************
 *                                           CONSTANTS                                            *
 ************************************************************************************************ */

// the maximum number of password update records that can be queried at a time
const __PASSWORD_UPDATE_QUERY_LIMIT = 30;





/* ************************************************************************************************
 *                                            HELPERS                                             *
 ************************************************************************************************ */

/**
 * Validates the format of a uid and ensures the record exists in the database.
 * @param uid
 * @param allowRoot
 * @returns Promise<void>
 * @throws
 * - 3506: if the uid has an invalid format
 * - 3507: if the record doesn't exist in the database
 * - 3508: if the record belongs to the root and has not been explicitly allowed
 */
const validateUserRecordExistance = async (uid: string, allowRoot?: boolean): Promise<void> => {
  if (!uuidValid(uid)) {
    throw new Error(encodeError(`The uid '${uid}' is invalid.`, 3506));
  }
  if (!allowRoot && isRoot(uid)) {
    throw new Error(encodeError(`The record for uid '${uid}' belongs to the root account and is not allowed for the requested action.`, 3508));
  }
  if (await getUserRecord(uid) === undefined) {
    throw new Error(encodeError(`The record for uid '${uid}' could not be found in the database.`, 3507));
  }
};





/* ************************************************************************************************
 *                                           RETRIEVERS                                           *
 ************************************************************************************************ */

/**
 * Verifies if the password update records can be listed for a given uid at a given time.
 * @param uid
 * @param limit
 * @param startAtEventTime
 * @returns Promise<void>
 * @throws
 * - 3506: if the uid has an invalid format
 * - 3507: if the record doesn't exist in the database
 * - 3508: if the record belongs to the root and has not been explicitly allowed
 * - 3511: if the starting point is provided but it's not a valid unix timestamp
 * - 3512: if the record limit is larger than the limit
 */
const canListUserPasswordUpdates = async (
  uid: string,
  limit: number,
  startAtEventTime: number | undefined,
): Promise<void> => {
  if (!integerValid(limit, 1, __PASSWORD_UPDATE_QUERY_LIMIT)) {
    throw new Error(encodeError(`The maximum number of password update records that can be retrieved at a time is ${__PASSWORD_UPDATE_QUERY_LIMIT}. Received: ${limit}`, 3512));
  }
  if (typeof startAtEventTime !== undefined && !timestampValid(startAtEventTime)) {
    throw new Error(encodeError(`If the startAtEventTime arg is provided, it must be a valid timestamp. Received: ${startAtEventTime}`, 3511));
  }
  await validateUserRecordExistance(uid);
};





/* ************************************************************************************************
 *                                    CREDENTIALS VERIFICATION                                    *
 ************************************************************************************************ */

/**
 * Verifies if the uid and the OTP token have the correct format before performing the verification.
 * @param uid
 * @param otpToken
 * @throws
 * - 3506: if the uid has an invalid format
 * - 3510: if the OTP Token has an invalid format
 */
const canVerifyOTPToken = (uid: string, otpToken: string): void => {
  if (!uuidValid(uid)) {
    throw new Error(encodeError(`The uid '${uid}' is invalid.`, 3506));
  }
  if (!otpTokenValid(otpToken)) {
    throw new Error(encodeError(`The OTP Token '${otpToken}' is invalid.`, 3510));
  }
};

/**
 * Verifies of the format of the data required to sign in.
 * @param nickname
 * @param password
 * @param otpToken
 * @param altchaPayload
 * @returns Promise<void>
 * @throws
 * - 3500: if the nickname's format is invalid
 * - 3509: if the pasword's format is invalid or is too weak
 * - 3510: if the OTP Token's format is invalid
 * - 2000: the altcha payload has an invalid format
 * - 2001: the altcha solution is invalid or it has expired
 */
const canVerifySignInCredentials = async (
  nickname: string,
  password: string,
  otpToken: string,
  altchaPayload: string,
): Promise<void> => {
  if (!nicknameValid(nickname)) {
    throw new Error(encodeError(`The nickname '${nickname}' is invalid.`, 3500));
  }
  if (!passwordValid(password)) {
    throw new Error(encodeError('The password is invalid or too weak. Make sure the password meets the requirements and try again.', 3509));
  }
  if (!otpTokenValid(otpToken)) {
    throw new Error(encodeError(`The OTP Token '${otpToken}' is invalid.`, 3510));
  }
  await AltchaService.verify(altchaPayload);
};





/* ************************************************************************************************
 *                                     USER RECORD MANAGEMENT                                     *
 ************************************************************************************************ */

/**
 * Validates the format of a nickname and it also checks if it is available.
 * @param nickname
 * @returns Promise<void>
 * @throws
 * - 3500: if the format of the nickname is invalid
 * - 3501: if the nickname is already being used
 */
const __canNicknameBeUsed = async (nickname: string): Promise<void> => {
  if (!nicknameValid(nickname)) {
    throw new Error(encodeError(`The nickname '${nickname}' is invalid.`, 3500));
  }
  if (await nicknameExists(nickname)) {
    throw new Error(encodeError(`The nickname '${nickname}' is already being used by another user.`, 3501));
  }
};

/**
 * Validates the user creation data based on the kind of user (root and nonroot).
 * @param nickname
 * @param authority
 * @param password
 * @returns Promise<void>
 * @throws
 * - 3500: if the format of the nickname is invalid
 * - 3501: if the nickname is already being used
 * - 3502: if the root's authority is not the highest
 * - 3503: if the root's password is invalid or weak
 * - 3504: if a password is provided when creating a nonroot user
 * - 3505: if the authority provided is not ranging 1 - 4
 */
const canUserBeCreated = async (
  nickname: string,
  authority: IAuthority,
  password: string | undefined,
): Promise<void> => {
  // validate the nickname
  await __canNicknameBeUsed(nickname);

  // proceed based on the kind of user
  if (isRoot(nickname)) {
    if (authority !== 5) {
      throw new Error(encodeError(`The root's authority must be 5. Received: ${authority}`, 3502));
    }
    if (!passwordValid(password)) {
      throw new Error(encodeError('The root account cannot be created with an invalid|weak password.', 3503));
    }
  } else {
    if (password !== undefined) {
      throw new Error(encodeError('A password cannot be provided when creating a nonroot user.', 3504));
    }
    if (!authorityValid(authority, 4)) {
      throw new Error(encodeError(`The nonroot user's authority must range 1 - 4. Received: ${authority}`, 3505));
    }
  }
};

/**
 * Validates the user's record and makes sure the nickname can be used.
 * @param uid
 * @param newNickname
 * @returns Promise<void>
 * @throws
 * - 3500: if the format of the nickname is invalid
 * - 3501: if the nickname is already being used
 * - 3506: if the uid has an invalid format
 * - 3507: if the record doesn't exist in the database
 * - 3508: if the record belongs to the root and has not been explicitly allowed
 */
const canNicknameBeUpdated = async (uid: string, newNickname: string): Promise<void> => {
  await validateUserRecordExistance(uid);
  await __canNicknameBeUsed(newNickname);
};

/**
 * Validates the user's record and makes sure the authority can be set.
 * @param uid
 * @param newNickname
 * @returns Promise<void>
 * @throws
 * - 3505: if the authority provided is not ranging 1 - 4
 * - 3506: if the uid has an invalid format
 * - 3507: if the record doesn't exist in the database
 * - 3508: if the record belongs to the root and has not been explicitly allowed
 */
const canAuthorityBeUpdated = async (uid: string, newAuthority: IAuthority): Promise<void> => {
  if (!authorityValid(newAuthority, 4)) {
    throw new Error(encodeError(`The nonroot user's authority must range 1 - 4. Received: ${newAuthority}`, 3505));
  }
  await validateUserRecordExistance(uid);
};

/**
 * Validates the user's required data to update / set their password.
 * @param uid
 * @param newPassword
 * @param altchaPayload
 * @returns Promise<void>
 * @throws
 * - 3508: if attempting to update the root's password
 * - 3509: if the password is invalid or too weak
 * - 2000: the altcha payload has an invalid format
 * - 2001: the altcha solution is invalid or it has expired
 */
const canPasswordBeUpdated = async (
  uid: string,
  newPassword: string,
  altchaPayload: string,
): Promise<void> => {
  if (isRoot(uid)) {
    throw new Error(encodeError(`The record for uid '${uid}' belongs to the root account and is not allowed for the requested action.`, 3508));
  }
  if (!passwordValid(newPassword)) {
    throw new Error(encodeError(`The password for uid '${uid}' is invalid or too weak. Make sure the password meets the requirements and try again.`, 3509));
  }
  await AltchaService.verify(altchaPayload);
};





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  // helpers
  validateUserRecordExistance,

  // retrievers
  canListUserPasswordUpdates,

  // credentials verification
  canVerifyOTPToken,
  canVerifySignInCredentials,

  // user record management
  canUserBeCreated,
  canNicknameBeUpdated,
  canAuthorityBeUpdated,
  canPasswordBeUpdated,
};
