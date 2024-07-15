import { addMinutes, addDays, subDays } from 'date-fns';
import { ENVIRONMENT } from '../../shared/environment/index.js';
import { UserService } from '../user/index.js';
import { IJWTService, IRefreshTokenRecord } from './types.js';
import { canRecordsBeListed, canRefreshAccessJWT, canUserSignOut } from './validations.js';
import { sign, verify } from './jwt.js';
import {
  getUidByRefreshToken,
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
  const __REFRESH_JWT_DURATION_MS = __REFRESH_JWT_DURATION * ((24 * 60 * 60) * 1000);

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
    addMinutes(new Date(), __ACCESS_JWT_DURATION),
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
    addDays(new Date(), __REFRESH_JWT_DURATION),
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
    await saveRecord(uid, refresh);

    // finally, return both JWTs
    return { access, refresh };
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
   * - 4750: if there isn't a record that matches the refreshToken
   */
  const refreshAccessJWT = async (refreshJWT: string): Promise<string> => {
    // decode the JWT
    const decodedUID = await verify(refreshJWT, __SECRET.refresh);

    // extract the uid from the Refresh JWT Records
    const retrievedUID = await getUidByRefreshToken(refreshJWT);

    // validate the data
    canRefreshAccessJWT(decodedUID, retrievedUID);

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
   */
  const signOut = async (uid: string, refreshJWT: string, allDevices?: boolean): Promise<void> => {
    // validate the request
    canUserSignOut(uid, refreshJWT);

    // sign the user out accordingly
    await deleteUserRecords(uid, allDevices === true ? undefined : refreshJWT);
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
    await deleteExpiredRecords(subDays(new Date(), __ACCESS_JWT_DURATION + 1).getTime());

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
