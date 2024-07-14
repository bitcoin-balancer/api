import { encodeError } from 'error-message-utils';
import { sortRecords } from '../../shared/utils/index.js';
import { generateUUID } from '../../shared/uuid/index.js';
import { IUserService, IAuthority, IUser } from './types.js';
import { checkOTPToken, generateOTPSecret } from './otp.js';
import { hashPassword } from './bcrypt.js';
import {
  validateUserRecordExistance,
  canVerifyOTPToken,
  canUserBeCreated,
  canNicknameBeUpdated,
  canAuthorityBeUpdated,
  canPasswordBeUpdated,
} from './validations.js';
import {
  listUserRecords,
  getUserRecordByNickname,
  getUserOTPSecret,
  createUserRecord,
  updateUserNickname,
  updateUserAuthority,
  updateUserPasswordHash,
  updateUserOTPSecret,
  deleteUserRecord,
} from './model.js';

/* ************************************************************************************************
 *                                         IMPLEMENTATION                                         *
 ************************************************************************************************ */

/**
 * User Service Factory
 * Generates the object in charge of creating and managing users.
 * @returns IUserService
 */
const userServiceFactory = (): IUserService => {
  /* **********************************************************************************************
   *                                          PROPERTIES                                          *
   ********************************************************************************************** */

  // an object containing all the user records by uid and is built on start up
  let __users: { [uid: string]: IUser } = {};





  /* **********************************************************************************************
   *                                          RETRIEVERS                                          *
   ********************************************************************************************** */

  /**
   * Retrieves the list of existing user records ordered by authority descendingly.
   * @returns IUser[]
   */
  const listUsers = (): IUser[] => {
    const users = Object.values(__users);
    users.sort(sortRecords('authority', 'desc'));
    return users;
  };





  /* **********************************************************************************************
   *                                    CREDENTIALS VERIFICATION                                  *
   ********************************************************************************************** */



  /**
   * Validates and verifies an OTP Token for a user against the secret.
   * @param uid
   * @param otpToken
   * @returns Promise<void>
   * @throws
   * - 3250: if the user record does not exist or the OTP Secret is not valid
   * - 3506: if the uid has an invalid format
   * - 3510: if the OTP Token has an invalid format
   * - 3000: if the OTP Token failed the verification
   */
  const verifyOTPToken = async (uid: string, otpToken: string): Promise<void> => {
    canVerifyOTPToken(uid, otpToken);
    if (!checkOTPToken(otpToken, await getUserOTPSecret(uid))) {
      throw new Error(encodeError(`The OTP Token '${otpToken}' for uid '${uid}' is invalid.`, 3000));
    }
  };





  /* **********************************************************************************************
   *                                    USER RECORD MANAGEMENT                                    *
   ********************************************************************************************** */

  /**
   * Creates a User Record and returns it. Pass the password only when creating the root account.
   * Normal users should set the password by going through the Password Update functionality.
   * @param nickname
   * @param authority
   * @param password?
   * @returns Promise<IUser>
  * @throws
  * - 3500: if the format of the nickname is invalid
  * - 3501: if the nickname is already being used
  * - 3502: if the root's authority is not the highest
  * - 3503: if the root's password is invalid or weak
  * - 3504: if a password is provided when creating a nonroot user
  * - 3505: if the authority provided is not ranging 1 - 4
  */
  const createUser = async (
    nickname: string,
    authority: IAuthority,
    password?: string,
  ): Promise<IUser> => {
    // validate the request
    await canUserBeCreated(nickname, authority, password);

    // init record values
    const uid = generateUUID();
    const eventTime = Date.now();
    let passwordHash: string | undefined;
    if (typeof password === 'string') {
      passwordHash = await hashPassword(password);
    }

    // create the record and add it to the local object
    await createUserRecord(uid, nickname, authority, passwordHash, generateOTPSecret(), eventTime);
    __users[uid] = {
      uid,
      nickname,
      authority,
      event_time: eventTime,
    };

    // finally, return it
    return {
      uid,
      nickname,
      authority,
      event_time: eventTime,
    };
  };

  /**
   * Validates and updates a nonroot user's nickname.
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
  const updateNickname = async (uid: string, newNickname: string): Promise<void> => {
    await canNicknameBeUpdated(uid, newNickname);
    await updateUserNickname(uid, newNickname);
    __users[uid].nickname = newNickname;
  };

  /**
   * Validates and updates a nonroot user's authority.
   * @param uid
   * @param newAuthority
   * @returns Promise<void>
   * @throws
   * - 3505: if the authority provided is not ranging 1 - 4
   * - 3506: if the uid has an invalid format
   * - 3507: if the record doesn't exist in the database
   * - 3508: if the record belongs to the root and has not been explicitly allowed
   */
  const updateAuthority = async (uid: string, newAuthority: IAuthority): Promise<void> => {
    await canAuthorityBeUpdated(uid, newAuthority);
    await updateUserAuthority(uid, newAuthority);
    __users[uid].authority = newAuthority;
  };

  /**
   * Validates and updates a nonroot user's password hash.
   * @param nickname
   * @param newPassword
   * @param otpToken
   * @param altchaPayload
   * @returns Promise<void>
   * @throws
   * - 3252: if no record is found for the nickname
   * - 3508: if attempting to update the root's password
   * - 3509: if the password is invalid or too weak
   * - 2000: the payload has an invalid format
   * - 2001: the solution is invalid or it has expired
   * - 3250: if the user record does not exist or the OTP Secret is not valid
   * - 3506: if the uid has an invalid format
   * - 3510: if the OTP Token has an invalid format
   * - 3000: if the OTP Token failed the verification
   */
  const updatePasswordHash = async (
    nickname: string,
    newPassword: string,
    otpToken: string,
    altchaPayload: string,
  ): Promise<void> => {
    // retrieve the record
    const { uid } = await getUserRecordByNickname(nickname);

    // validate the request
    await canPasswordBeUpdated(uid, newPassword, altchaPayload);

    // validate the otp token
    await verifyOTPToken(uid, otpToken);

    // hash the new password and update the record
    await updateUserPasswordHash(uid, await hashPassword(newPassword));
  };

  /**
   * Validates and updates a nonroot user's OTP Secret. The new secret is returned on completion.
   * @param uid
   * @returns Promise<string>
   * @throws
   * - 3506: if the uid has an invalid format
   * - 3507: if the record doesn't exist in the database
   * - 3508: if the record belongs to the root and has not been explicitly allowed
   */
  const updateOTPSecret = async (uid: string): Promise<string> => {
    await validateUserRecordExistance(uid);
    const newSecret = generateOTPSecret();
    await updateUserOTPSecret(uid, newSecret);
    return newSecret;
  };

  /**
   * Validates and deletes a nonroot user account.
   * @param uid
   * @returns Promise<void>
   * @throws
   * - 3506: if the uid has an invalid format
   * - 3507: if the record doesn't exist in the database
   * - 3508: if the record belongs to the root and has not been explicitly allowed
   */
  const deleteUser = async (uid: string): Promise<void> => {
    await validateUserRecordExistance(uid);
    await deleteUserRecord(uid);
    delete __users[uid];
  };




  /* **********************************************************************************************
   *                                         INITIALIZER                                          *
   ********************************************************************************************** */

  /**
   * Initializes the User Module.
   * @returns Promise<void>
   */
  const initialize = async (): Promise<void> => {
    __users = (await listUserRecords()).reduce(
      (previous, current) => ({
        ...previous,
        [current.uid]: {
          uid: current.uid,
          nickname: current.nickname,
          authority: current.authority,
          event_time: current.event_time,
        },
      }),
      {},
    );
  };

  /**
   * Tears down the User Module.
   * @returns Promise<void>
   */
  const teardown = async (): Promise<void> => {
    __users = {};
  };





  /* **********************************************************************************************
   *                                         MODULE BUILD                                         *
   ********************************************************************************************** */
  return Object.freeze({
    // properties
    // ...

    // retrievers
    listUsers,

    // credentials verification
    verifyOTPToken,

    // user record management
    createUser,
    updateNickname,
    updateAuthority,
    updatePasswordHash,
    updateOTPSecret,
    deleteUser,

    // initializer
    initialize,
    teardown,
  });
};





/* ************************************************************************************************
 *                                        GLOBAL INSTANCE                                         *
 ************************************************************************************************ */
const UserService = userServiceFactory();





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  UserService,
};
