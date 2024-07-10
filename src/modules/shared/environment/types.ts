

/* ************************************************************************************************
 *                                             TYPES                                              *
 ************************************************************************************************ */

/**
 * Environment Name
 * The name of the kinds of environments that can be used when running Node.js processes.
 */
type INodeEnv = 'development' | 'production';

/**
 * Root Account
 * The account with the highest authority in the platform. Also the only one who can fully interact
 * with the Auth Module.
 */
type IRootAccountConfig = {
  // the universally unique identifier (v4) that belongs to the root account
  uid: string;

  // the root's nickname
  nickname: string;

  // the password to authenticate the root account. This password cannot be changed
  password: string;

  // the secret that will be used to generate OTP tokens for the root account
  otpSecret: string;
};

/**
 * Telegram
 * The configuration that will be used to initialize the Telegram instance in order to be able to
 * send messages. If Telegram is not integrated, the token property will be an empty string while
 * the chatID will be equals to 0.
 */
type ITelegramConfig = {
  // the token used to managed BalancerBot via HTTP
  token: string;

  // the id of the group in which all notifications will be broadcasted to
  chatID: number;
};

/**
 * JWT Secret
 * The secrets that will be used to generate Access and Refresh Tokens.
 */
type IJWTSecretConfig = {
  // the secret that will be used to generate refresh tokens
  refresh: string;

  // the secret that will be used to generate access tokens
  access: string;
};

/**
 * Environment
 * The object that contains all the environment variables required by the API.
 */
type IEnvironment = {
  // the kind of environment the API was started with
  NODE_ENV: INodeEnv;

  // if enabled, the API will be setup with the sole purpose of running unit & integration tests
  TEST_MODE: boolean;

  // if enabled, the API will be setup with the sole purpose of restoring the database
  RESTORE_MODE: boolean;

  // if enabled, means that Balancer is behind a Cloudflare Tunnel (Proxied)
  HAS_TUNNEL_TOKEN: boolean;

  // the port that will be exposed publicly by the server
  API_PORT: number;

  // the configuration that will be used to establish the connection with postgres
  POSTGRES_HOST: string;
  POSTGRES_USER: string;
  POSTGRES_DB: string;
  POSTGRES_PORT: number;
  POSTGRES_PASSWORD_FILE: string;

  // the only account that can have an authority of 5 in Balancer
  ROOT_ACCOUNT: IRootAccountConfig;

  // the configuration that will be used to initialize telegram (optionally)
  TELEGRAM: ITelegramConfig;

  // the secret that will be used to sign Altcha Challenges with HMAC
  ALTCHA_SECRET: string;

  // the secrets that will be used to generate access and refresh auth tokens
  JWT_SECRET: IJWTSecretConfig;
};





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export type {
  INodeEnv,
  IRootAccountConfig,
  ITelegramConfig,
  IJWTSecretConfig,
  IEnvironment,
};
