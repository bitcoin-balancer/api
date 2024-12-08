import { addMinutes, addDays, subDays } from 'date-fns';
import ms from 'ms';
import { encodeError } from 'error-message-utils';
import { ENVIRONMENT } from '../../shared/environment/index.js';
import { hashData, verifyHashedData } from '../../shared/hash/index.js';
import { UserService } from '../user/index.js';
import { IJWTService, IRefreshTokenRecord } from './types.js';
import { canRecordsBeListed, canUserSignOut } from './validations.js';
import { sign, verify } from './jwt.js';
import {
  getRefreshTokensByUID,
  listRecordsByUID,
  saveRecord,
  deleteUserRecords,
  deleteExpiredRecords,
} from './model.js';

/* ************************************************************************************************
 *                                         IMPLEMENTATION                                         *
 ************************************************************************************************ */

/**
 * JWT Service Factory
 * Generates the object in charge of managing the authentication of users.
 * @returns IJWTService
 */
const jwtServiceFactory = (): IJWTService => {
  /* **********************************************************************************************
   *                                          PROPERTIES                                          *
   ********************************************************************************************** */

  // the secrets to sign access and refresh tokens
  const __SECRET = ENVIRONMENT.JWT_SECRET;

  // the number of minutes an access token is valid for
  const __ACCESS_JWT_DURATION = 15;

  // the number of days a refresh token is valid for
  const __REFRESH_JWT_DURATION = 30;
  const __REFRESH_JWT_DURATION_MS = ms(`${__REFRESH_JWT_DURATION} days`);

  // the name of the property that will contain the user's Refresh JWT
  const __REFRESH_JWT_COOKIE_NAME = 'refreshJWT';





  /* **********************************************************************************************
   *                                          RETRIEVERS                                          *
   ********************************************************************************************** */

  /**
   * Validates and lists the refresh token records for an uid.
   * @param uid
   * @returns Promise<IRefreshTokenRecord[]>
   * @throws
   * - 4500: if the uid has an invalid format
   */
  const listRecords = (uid: string): Promise<IRefreshTokenRecord[]> => {
    canRecordsBeListed(uid);
    return listRecordsByUID(uid);
  };




  /* **********************************************************************************************
   *                                        JWT GENERATORS                                        *
   ********************************************************************************************** */

  /**
   * Generates an Access JWT for an uid.
   * @param uid
   * @returns Promise<string>
   * @throws
   * - 4250: if the jsonwebtoken lib fails to sign the token
   * - 4251: if the signed token has an invalid format
   */
  const __generateAccessToken = (uid: string): Promise<string> => sign(
    uid,
    addMinutes(Date.now(), __ACCESS_JWT_DURATION),
    __SECRET.access,
  );

  /**
   * Generates a Refresh JWT for an uid.
   * @param uid
   * @returns Promise<string>
   * @throws
   * - 4250: if the jsonwebtoken lib fails to sign the token
   * - 4251: if the signed token has an invalid format
   */
  const __generateRefreshToken = (uid: string): Promise<string> => sign(
    uid,
    addDays(Date.now(), __REFRESH_JWT_DURATION),
    __SECRET.refresh,
  );





  /* **********************************************************************************************
   *                                         AUTH ACTIONS                                         *
   ********************************************************************************************** */

  /**
   * Verifies the user's credentials and executes the authentication process.
   * @param nickname
   * @param password
   * @param otpToken
   * @param altchaPayload
   * @returns Promise<{ access: string, refresh: string }>
   * @throws
   * - 3500: if the nickname's format is invalid
   * - 3509: if the pasword's format is invalid or is too weak
   * - 3510: if the OTP Token's format is invalid
   * - 2000: the altcha payload has an invalid format
   * - 2001: the altcha solution is invalid or it has expired
   * - 3004: if the password verification fails
   * - 3005: hides the original error in production to avoid leaking information
   * - 4250: if the jsonwebtoken lib fails to sign the token
   * - 4251: if the signed token has an invalid format
   */
  const signIn = async (
    nickname: string,
    password: string,
    otpToken: string,
    altchaPayload: string,
  ): Promise<{ access: string, refresh: string }> => {
    // verify the credentials
    const uid = await UserService.verifySignInCredentials(
      nickname,
      password,
      otpToken,
      altchaPayload,
    );

    // generate the JWTs
    const [access, refresh] = await Promise.all([
      __generateAccessToken(uid),
      __generateRefreshToken(uid),
    ]);

    // store the refresh token (user's session)
    await saveRecord(uid, await hashData(refresh));

    // finally, return both JWTs
    return { access, refresh };
  };

  /**
   * Decodes an Access JWT and returns the UID.
   * @param accessJWT
   * @returns Promise<string>
   * @throws
   * - 4252: if the lib fails to verify the JWT for any reason (most likely, the token expired)
   * - 4253: if the decoded data is an invalid object or does not contain the uid
   */
  const verifyAccessToken = (accessJWT: string): Promise<string> => (
    verify(accessJWT, __SECRET.access)
  );

  /**
   * Decodes a Refresh JWT and returns the UID.
   * @param refreshJWT
   * @returns Promise<string>
   * @throws
   * - 4252: if the lib fails to verify the JWT for any reason (most likely, the token expired)
   * - 4253: if the decoded data is an invalid object or does not contain the uid
   */
  const verifyRefreshToken = (refreshJWT: string): Promise<string> => (
    verify(refreshJWT, __SECRET.refresh)
  );

  /**
   * Retrieves the hashed representation of a Refresh JWT if it is currently active. Otherwise, it
   * returns undefined.
   * @param uid
   * @param refreshJWT
   * @returns Promise<string | undefined>
   * @throws
   * - 4750: if the user doesn't have Refresh JWTs
   */
  const __toRefreshTokenHash = async (
    uid: string,
    refreshJWT: string,
  ): Promise<string | undefined> => {
    // retrieve all the tokens that have been assigned to the user
    const tokens = await getRefreshTokensByUID(uid);

    // check if the token was assigned to the uid
    let i = 0;
    let hash: string | undefined;
    while (hash === undefined && i < tokens.length) {
      // eslint-disable-next-line no-await-in-loop
      if (await verifyHashedData(tokens[i], refreshJWT)) {
        hash = tokens[i];
      }
      i += 1;
    }
    return hash;
  };

  /**
   * Refreshes an access token based on a long lived Refresh JWT.
   * @param refreshJWT
   * @returns Promise<string>
   * @throws
   * - 4250: if the jsonwebtoken lib fails to sign the token
   * - 4251: if the signed token has an invalid format
   * - 4252: if the lib fails to verify the JWT for any reason (most likely, the token expired)
   * - 4253: if the decoded data is an invalid object or does not contain the uid
   * - 4750: if the user doesn't have Refresh JWTs
   * - 4000: if the token was not assigned to the uid claiming it
   */
  const refreshAccessJWT = async (refreshJWT: string): Promise<string> => {
    // decode the JWT
    const decodedUID = await verifyRefreshToken(refreshJWT);

    // ensure the token is active
    if (await __toRefreshTokenHash(decodedUID, refreshJWT) === undefined) {
      throw new Error(encodeError(`The provided Refresh JWT has not been assigned to uid '${decodedUID}'.`, 4000));
    }

    // finally, generate the token and return it
    return __generateAccessToken(decodedUID);
  };

  /**
   * Signs an user out from a single or multiple devices in one go.
   * @param uid
   * @param refreshJWT
   * @param allDevices?
   * @returns Promise<void>
   * @throws
   * - 4500: if the uid has an invalid format
   * - 4501: if the Refresh JWT has an invalid format
   * - 4750: if the user doesn't have Refresh JWTs
   */
  const signOut = async (uid: string, refreshJWT: string, allDevices?: boolean): Promise<void> => {
    // validate the request
    canUserSignOut(uid, refreshJWT);

    // sign the user out accordingly
    await deleteUserRecords(
      uid,
      allDevices === true ? undefined : await __toRefreshTokenHash(uid, refreshJWT),
    );
  };





  /* **********************************************************************************************
   *                                         MAINTENANCE                                          *
   ********************************************************************************************** */

  /**
   * Executes all the maintenance processes in order to keep the module fast and efficient.
   * @returns Promise<void>
   */
  const __runMaintenance = async (): Promise<void> => {
    // delete expired records
    await deleteExpiredRecords(subDays(Date.now(), __REFRESH_JWT_DURATION + 1).getTime());

    // ...
  };





  /* **********************************************************************************************
   *                                         INITIALIZER                                          *
   ********************************************************************************************** */

  /**
   * Initializes the JWT Module.
   * @returns Promise<void>
   */
  const initialize = async (): Promise<void> => {
    // ...
  };

  /**
   * Tears down the JWT Module.
   * @returns Promise<void>
   */
  const teardown = async (): Promise<void> => {
    await __runMaintenance();
  };





  /* **********************************************************************************************
   *                                         MODULE BUILD                                         *
   ********************************************************************************************** */
  return Object.freeze({
    // properties
    get REFRESH_JWT_DURATION_MS() {
      return __REFRESH_JWT_DURATION_MS;
    },
    get REFRESH_JWT_COOKIE_NAME() {
      return __REFRESH_JWT_COOKIE_NAME;
    },

    // retrievers
    listRecords,

    // auth actions
    signIn,
    verifyAccessToken,
    verifyRefreshToken,
    refreshAccessJWT,
    signOut,

    // initializer
    initialize,
    teardown,
  });
};





/* ************************************************************************************************
 *                                        GLOBAL INSTANCE                                         *
 ************************************************************************************************ */
const JWTService = jwtServiceFactory();





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  JWTService,
};
