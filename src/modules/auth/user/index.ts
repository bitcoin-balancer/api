import { generateUUID } from '../../shared/uuid/index.js';
import { IUserService, IAuthority, IUser } from './types.js';
import { generateOTPSecret } from './otp.js';
import { hashPassword } from './bcrypt.js';
import {
  canUserBeCreated,
  canNicknameBeUpdated,
  canAuthorityBeUpdated,
} from './validations.js';
import {
  getUserRecord,
  createUserRecord,
  updateUserNickname,
  updateUserAuthority,
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





  /* **********************************************************************************************
   *                                          RETRIEVERS                                          *
   ********************************************************************************************** */

  /* const list */





  /* **********************************************************************************************
   *                                    USER RECORD MANAGEMENT                                    *
   ********************************************************************************************** */

  /**
   * Creates a User Record and returns it. Pass the password only when creating the root account.
   * Normal users should set the password by going through the Password Update functionality.
   * @param nickname
   * @param authority
   * @param password
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
   * Validates and updates an user's nickname.
   * @param uid
   * @param newNickname
   * @returns Promise<void>
   * @throws
   * - 3500: if the format of the nickname is invalid
   * - 3501: if the nickname is already being used
   * - 3506: if the record doesn't exist in the database
   */
  const updateNickname = async (uid: string, newNickname: string): Promise<void> => {
    await canNicknameBeUpdated(uid, await getUserRecord(uid), newNickname);
    await updateUserNickname(uid, newNickname);
  };

  /**
   * Validates and updates an user's authority.
   * @param uid
   * @param newAuthority
   * @returns Promise<void>
   * @throws
   * - 3505: if the authority provided is not ranging 1 - 4
   * - 3506: if the record doesn't exist in the database
   */
  const updateAuthority = async (uid: string, newAuthority: IAuthority): Promise<void> => {
    canAuthorityBeUpdated(uid, await getUserRecord(uid), newAuthority);
    await updateUserAuthority(uid, newAuthority);
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

    // user record management
    createUser,
    updateNickname,
    updateAuthority,

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
