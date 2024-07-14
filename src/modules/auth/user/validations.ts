import { encodeError } from 'error-message-utils';
import { nicknameValid } from '../../shared/validations/index.js';
import { IAuthority } from './types.js';
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
const canNicknameBeUsed = async (nickname: string): Promise<void> => {
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
 */
const canUserBeCreated = async (
  nickname: string,
  authority: IAuthority,
  password: string | undefined,
): Promise<void> => {
  // validate the nickname
  await canNicknameBeUsed(nickname);
};





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  // user record management
  canUserBeCreated,
};
