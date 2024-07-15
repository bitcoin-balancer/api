import { addMinutes, addDays } from 'date-fns';
import { ENVIRONMENT } from '../../shared/environment/index.js';
import { UserService } from '../user/index.js';
import { IJWTService } from './types.js';
import { sign } from './jwt.js';

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
  const __ACCESS_TOKEN_DURATION = 15;

  // the number of days a refresh token is valid for
  const __REFRESH_TOKEN_DURATION = 30;
  const __REFRESH_TOKEN_DURATION_MS = __REFRESH_TOKEN_DURATION * ((24 * 60 * 60) * 1000);





  /* **********************************************************************************************
   *                                        JWT GENERATORS                                        *
   ********************************************************************************************** */

  /**
   * Generates an Access JWT for an uid.
   * @param uid
   * @returns Promise<string>
   */
  const __generateAccessToken = (uid: string): Promise<string> => sign(
    uid,
    addMinutes(new Date(), __ACCESS_TOKEN_DURATION),
    __SECRET.access,
  );

  /**
   * Generates a Refresh JWT for an uid.
   * @param uid
   * @returns Promise<string>
   */
  const __generateRefreshToken = (uid: string): Promise<string> => sign(
    uid,
    addDays(new Date(), __REFRESH_TOKEN_DURATION),
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
    // @TODO

    // finally, return both JWTs
    return { access, refresh };
  };

  /**
   * Refreshes an access token based on a long lived Refresh JWT.
   * @param refreshJWT
   * @returns Promise<string>
   */
  const refreshAccessJWT = async (refreshJWT: string): Promise<string> => '';

  /**
   * Signs an user out from a single or multiple devices in one go.
   * @param uid
   * @param refreshJWT
   * @param allDevices?
   * @returns Promise<void>
   */
  const signOut = async (uid: string, refreshJWT: string, allDevices?: boolean): Promise<void> => {
    // validate the request
    // @TODO

    // sign the user out accordingly
    // @TODO
  };

  /**
   * Signs all the users out of Balancer, including the root account.
   * @returns Promise<void>
   */
  const signAllUsersOut = async (): Promise<void> => undefined;





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
    // ...
  };





  /* **********************************************************************************************
   *                                         MODULE BUILD                                         *
   ********************************************************************************************** */
  return Object.freeze({
    // properties
    get REFRESH_TOKEN_DURATION_MS() {
      return __REFRESH_TOKEN_DURATION_MS;
    },

    // auth actions
    signIn,
    signOut,
    signAllUsersOut,

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
