import { encodeError } from 'error-message-utils';
import { authorityValid, nicknameValid, passwordValid } from '../../shared/validations/index.js';
import { IAuthority, IUser } from './types.js';
import { isRoot } from './utils.js';
import { nicknameExists } from './model.js';

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
 * @param record
 * @param newNickname
 * @returns Promise<void>
 * @throws
 * - 3500: if the format of the nickname is invalid
 * - 3501: if the nickname is already being used
 * - 3506: if the user's record is undefined
 */
const canNicknameBeUpdated = async (
  record: IUser | undefined,
  newNickname: string,
): Promise<void> => {
  if (record === undefined) {
    throw new Error(encodeError(`Unable to set the nickname to '${newNickname}' because the user record doesn't exist.`, 3506));
  }
  await __canNicknameBeUsed(newNickname);
};




/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  // user record management
  canUserBeCreated,
  canNicknameBeUpdated,
};
