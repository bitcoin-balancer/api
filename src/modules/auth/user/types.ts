

/* ************************************************************************************************
 *                                            SERVICE                                             *
 ************************************************************************************************ */

/**
 * User Service
 * Object in charge of creating and managing users.
 */
type IUserService = {
  // properties
  // ...

  // retrievers
  listUsers: () => IUser[];
  getUser: (uid: string) => IUser;
  getOTPSecret: (uid: string) => Promise<string>;
  listUserPasswordUpdates: (
    uid: string,
    startAtEventTime: number | undefined,
  ) => Promise<IPasswordUpdate[]>;

  // credentials verification
  isAuthorized: (uid: string, requiredAuthority: IAuthority) => void;
  verifyOTPToken: (uid: string, token: string) => Promise<void>;
  verifySignInCredentials: (
    nickname: string,
    password: string,
    otpToken: string,
    altchaPayload: string,
  ) => Promise<string>;

  // user record management
  createUser: (nickname: string, authority: IAuthority, password?: string) => Promise<IUser>;
  updateNickname: (uid: string, newNickname: string) => Promise<void>;
  updateAuthority: (uid: string, newAuthority: IAuthority) => Promise<void>;
  updatePasswordHash: (
    nickname: string,
    newPassword: string,
    otpToken: string,
    altchaPayload: string,
  ) => Promise<void>;
  updateOTPSecret: (uid: string) => Promise<string>;
  deleteUser: (uid: string) => Promise<void>;

  // initializer
  initialize: () => Promise<void>;
  teardown: () => Promise<void>;
};





/* ************************************************************************************************
 *                                             TYPES                                              *
 ************************************************************************************************ */

/**
 * Authority
 * The level of authority determines the data that can be read and the actions that can be taken
 * by a user.
 */
type IAuthority = 1 | 2 | 3 | 4 | 5;

/**
 * User
 * The user record that is stored in the database. Note that some data is sensitive and therefore it
 * is never sent in a Response.
 */
type IUser = {
  // the universally unique identifier generated for the user
  uid: string;

  // the username -> this value is used to sign in and is case sensitive
  nickname: string;

  // the user's level of authority
  authority: IAuthority;

  // the hashed version of the user's password
  password_hash?: string;

  // secret key used in order to generate OTP Tokens
  otp_secret?: string;

  // the timestamp in ms when the account was first created by root
  event_time: number;
};

/**
 * Password Update
 * The record stored whenever a user updates their password.
 */
type IPasswordUpdate = {
  uid: string;
  event_time: number;
};




/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export type {
  // service
  IUserService,

  // types
  IAuthority,
  IUser,
  IPasswordUpdate,
};
