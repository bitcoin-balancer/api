

/* ************************************************************************************************
 *                                            SERVICE                                             *
 ************************************************************************************************ */

/**
 * JWT Service
 * Object in charge of managing the authentication of users.
 */
type IJWTService = {
  // properties
  REFRESH_JWT_DURATION_MS: number;
  REFRESH_JWT_COOKIE_NAME: string;

  // auth actions
  signIn: (
    nickname: string,
    password: string,
    otpToken: string,
    altchaPayload: string,
  ) => Promise<{ access: string, refresh: string }>;
  refreshAccessJWT: (refreshJWT: string) => Promise<string>;
  signOut: (uid: string, refreshJWT: string, allDevices?: boolean) => Promise<void>;
  signAllUsersOut: () => Promise<void>;

  // initializer
  initialize: () => Promise<void>;
  teardown: () => Promise<void>;
};





/* ************************************************************************************************
 *                                             TYPES                                              *
 ************************************************************************************************ */

/**
 * Refresh Token
 * A record is generated and stored whenever a user signs in on a device.
 */
type IRefreshToken = {
  // the owner of the token
  uid: string;

  // the refresh token
  token: string;

  // the time at which the token was issued
  event_time: string;
};





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export type {
  // service
  IJWTService,

  // types
  IRefreshToken,
};
