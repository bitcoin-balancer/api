import { generateUUID } from '../../shared/uuid/index.js';
import { IUserService, IAuthority, IUser } from './types.js';
import { generateOTPSecret } from './otp.js';
import { hashPassword } from './bcrypt.js';
import { canUserBeCreated } from './validations.js';
import { createUserRecord } from './model.js';

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
