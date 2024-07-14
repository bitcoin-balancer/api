import { encodeError } from 'error-message-utils';
import { generateUUID } from '../../shared/uuid/index.js';
import { IUserService, IAuthority, IUser } from './types.js';
import { checkOTPToken, generateOTPSecret } from './otp.js';
import { hashPassword } from './bcrypt.js';
import {
  canUserBeCreated,
  canNicknameBeUpdated,
  canAuthorityBeUpdated,
  canPasswordBeUpdated,
  canVerifyOTPToken,
} from './validations.js';
import {
  getUserRecordByNickname,
  createUserRecord,
  updateUserNickname,
  updateUserAuthority,
  updateUserPasswordHash,
  getUserOTPSecret,
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
  const __users: { [uid: string]: IUser } = {};





  /* **********************************************************************************************
   *                                          RETRIEVERS                                          *
   ********************************************************************************************** */

  /* const list */


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

    // create the record and return it
    await createUserRecord(uid, nickname, authority, passwordHash, generateOTPSecret(), eventTime);
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




  /* **********************************************************************************************
   *                                         INITIALIZER                                          *
   ********************************************************************************************** */

  /**
   * Initializes the User Module.
   * @returns Promise<void>
   */
  const initialize = async (): Promise<void> => {
    // ...
  };

  /**
   * Tears down the User Module.
   * @returns Promise<void>
   */
  const teardown = async (): Promise<void> => {
    // ...
  };





  /* **********************************************************************************************
   *                                         MODULE BUILD                                         *
   ********************************************************************************************** */
  return Object.freeze({
    // properties
    // ...

    // credentials verification
    verifyOTPToken,

    // user record management
    createUser,
    updateNickname,
    updateAuthority,
    updatePasswordHash,

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
