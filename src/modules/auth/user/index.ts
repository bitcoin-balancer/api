import { encodeError } from 'error-message-utils';
import { generateUUID, sortRecords } from 'web-utils-kit';
import { ENVIRONMENT } from '../../shared/environment/index.js';
import { decryptData, encryptData } from '../../shared/encrypt/index.js';
import { hashData, verifyHashedData } from '../../shared/hash/index.js';
import {
  IUserService,
  IAuthority,
  IUser,
  IPasswordUpdate,
} from './types.js';
import { generateOTPSecret, checkOTPToken } from './otp.js';
import {
  validateUserRecordExistance,
  canListUserPasswordUpdates,
  canVerifyOTPToken,
  canVerifySignInCredentials,
  canUserBeCreated,
  canNicknameBeUpdated,
  canAuthorityBeUpdated,
  canPasswordBeUpdated,
} from './validations.js';
import {
  listUserRecords,
  getUserRecordByNickname,
  getUserOTPSecret,
  getUserSignInDataByNickname,
  createUserRecord,
  updateUserNickname,
  updateUserAuthority,
  updateUserPasswordHash,
  updateUserOTPSecret,
  deleteUserRecord,
  listUserPasswordUpdateRecords,
  getUserRecord,
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

  /**
   * Retrieves a user record by uid from the local object.
   * @param uid
   * @returns IUser
   * @throws
   * - 3003: if there isn't a user matching the uid
   */
  const getUser = (uid: string): IUser => {
    if (!__users[uid]) {
      throw new Error(encodeError(`The user '${uid}' could not be found in the local users' object.`, 3003));
    }
    return __users[uid];
  };

  /**
   * Validates, retrieves and decrypts the OTP Secret for an ID.
   * @param uid
   * @returns Promise<string>
   * @throws
   * - 3506: if the uid has an invalid format
   * - 3507: if the record doesn't exist in the database
   * - 3508: if the record belongs to the root and has not been explicitly allowed
   * - 3250: if the user record does not exist or the OTP Secret is not valid
   */
  const getOTPSecret = async (uid: string): Promise<string> => {
    await validateUserRecordExistance(uid, true);
    return decryptData(await getUserOTPSecret(uid));
  };

  /**
   * Validates and retrieves the list of password update records for a uid.
   * @param uid
   * @param limit
   * @param startAtEventTime
   * @returns Promise<IPasswordUpdate[]>
   * @throws
   * - 3506: if the uid has an invalid format
   * - 3507: if the record doesn't exist in the database
   * - 3508: if the record belongs to the root and has not been explicitly allowed
   * - 3511: if the starting point is provided but it's not a valid unix timestamp
   * - 3512: if the query limit is larger than the limit
   */
  const listUserPasswordUpdates = async (
    uid: string,
    limit: number,
    startAtEventTime: number | undefined,
  ): Promise<IPasswordUpdate[]> => {
    await canListUserPasswordUpdates(uid, limit, startAtEventTime);
    return listUserPasswordUpdateRecords(uid, limit, startAtEventTime);
  };





  /* **********************************************************************************************
   *                                    CREDENTIALS VERIFICATION                                  *
   ********************************************************************************************** */

  /**
   * Verifies if a user is authorized to perform an action based on a requirement.
   * @param uid
   * @param requiredAuthority
   * @throws
   * - 3001: if the uid is invalid or not present in the users' object
   * - 3002: if the user is not authorized to perform the action
   */
  const isAuthorized = (uid: string, requiredAuthority: IAuthority): void => {
    if (typeof uid !== 'string' || !__users[uid]) {
      throw new Error(encodeError(`The uid '${uid}' was not found in the users object.`, 3001));
    }
    if (__users[uid].authority < requiredAuthority) {
      throw new Error(encodeError(`The user '${uid}' is not authorized to perform the action. Has ${__users[uid].authority} and needs ${requiredAuthority}`, 3002));
    }
  };

  /**
   * Validates and verifies an OTP Token for a user against the secret.
   * @param uid
   * @param otpToken
   * @param otpSecret? (encrypted)
   * @returns Promise<void>
   * @throws
   * - 3250: if the user record does not exist or the OTP Secret is not valid
   * - 3506: if the uid has an invalid format
   * - 3510: if the OTP Token has an invalid format
   * - 3000: if the OTP Token failed the verification
   */
  const verifyOTPToken = async (
    uid: string,
    otpToken: string,
    otpSecret?: string,
  ): Promise<void> => {
    canVerifyOTPToken(uid, otpToken);
    const secret = typeof otpSecret === 'string' ? otpSecret : await getUserOTPSecret(uid);
    if (!checkOTPToken(otpToken, await decryptData(secret))) {
      throw new Error(encodeError(`The OTP Token '${otpToken}' for uid '${uid}' is invalid.`, 3000));
    }
  };

  /**
   * Validates and verifies the sign in credentials are valid. If successful, returns the uid.
   * @param nickname
   * @param password
   * @param otpToken
   * @param altchaPayload
   * @returns Promise<string>
   * @throws
   * - 3500: if the nickname's format is invalid
   * - 3509: if the pasword's format is invalid or is too weak
   * - 3510: if the OTP Token's format is invalid
   * - 2000: the altcha payload has an invalid format
   * - 2001: the altcha solution is invalid or it has expired
   * - 3004: if the password verification fails
   * - 3005: hides the original error in production to avoid leaking information
   */
  const verifySignInCredentials = async (
    nickname: string,
    password: string,
    otpToken: string,
    altchaPayload: string,
  ): Promise<string> => {
    // validate the request
    await canVerifySignInCredentials(nickname, password, otpToken, altchaPayload);

    // in the case of an error, avoid leaking any confidential information (only in prod)
    try {
      // retrieve the sign in data
      const { uid, password_hash, otp_secret } = await getUserSignInDataByNickname(nickname);

      // verify the OTP Token
      await verifyOTPToken(uid, otpToken, otp_secret);

      // compare the password
      if (!await verifyHashedData(password_hash, password)) {
        throw new Error(encodeError('The password doesn\'t match the one stored in the database. Please double check it and try again.', 3004));
      }

      // finally, return the uid
      return uid;
    } catch (e) {
      if (ENVIRONMENT.NODE_ENV === 'production') {
        throw new Error(encodeError('The provided credentials are invalid. Please double-check them and try again. If your account is new, you must set a password via the "Password Update" section before signing in.', 3005));
      }
      throw e;
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
   * @param uid?
   * @param password?
   * @param otpSecret?
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
    uid?: string,
    password?: string,
    otpSecret?: string,
  ): Promise<IUser> => {
    // validate the request
    await canUserBeCreated(nickname, authority, password);

    // init record values
    const fUID = uid ?? generateUUID(4);
    const fOTPSecret = await encryptData(otpSecret ?? generateOTPSecret());
    const eventTime = Date.now();
    let passwordHash: string | undefined;
    if (typeof password === 'string') {
      passwordHash = await hashData(password);
    }

    // create the record and add it to the local object
    await createUserRecord(fUID, nickname, authority, passwordHash, fOTPSecret, eventTime);
    __users[fUID] = {
      uid: fUID,
      nickname,
      authority,
      event_time: eventTime,
    };

    // finally, return it
    return {
      uid: fUID,
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
   * - 2000: the altcha payload has an invalid format
   * - 2001: the altcha solution is invalid or it has expired
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
    await updateUserPasswordHash(uid, await hashData(newPassword));
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
    await updateUserOTPSecret(uid, await encryptData(newSecret));
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
   * Creates the root account record in case it doesn't exist.
   * @returns Promise<void>
   */
  const __initializeRootAccount = async (): Promise<void> => {
    if (await getUserRecord(ENVIRONMENT.ROOT_ACCOUNT.uid) === undefined) {
      await createUser(
        ENVIRONMENT.ROOT_ACCOUNT.nickname,
        5,
        ENVIRONMENT.ROOT_ACCOUNT.uid,
        ENVIRONMENT.ROOT_ACCOUNT.password,
        ENVIRONMENT.ROOT_ACCOUNT.otpSecret,
      );
    }
  };

  /**
   * Retrieves all the existing users and builds the local user object.
   * @returns Promise<{ [uid: string]: IUser }>
   */
  const __buildLocalUsersObject = async (): Promise<{ [uid: string]: IUser }> => (
    (await listUserRecords()).reduce(
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
    )
  );

  /**
   * Initializes the User Module.
   * @returns Promise<void>
   */
  const initialize = async (): Promise<void> => {
    // initialize the root account
    await __initializeRootAccount();

    // build the local object
    __users = await __buildLocalUsersObject();
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
    getUser,
    getOTPSecret,
    listUserPasswordUpdates,

    // credentials verification
    isAuthorized,
    verifyOTPToken,
    verifySignInCredentials,

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
  // service
  UserService,

  // types
  type IUser,
  type IAuthority,
};
