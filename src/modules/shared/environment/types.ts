import { z } from 'zod';

/* ************************************************************************************************
 *                                             TYPES                                              *
 ************************************************************************************************ */

/**
 * Environment Name
 * The name of the kinds of environments that can be used when running Node.js processes.
 */
const NodeEnvSchema = z.union([z.literal('development'), z.literal('production')]);
type INodeEnv = z.infer<typeof NodeEnvSchema>;

/**
 * Root Account
 * The account with the highest authority in the platform. Also the only one who can fully interact
 * with the Auth Module.
 */
const RootAccountSchema = z.object({
  // the universally unique identifier (v4) that belongs to the root account
  uid: z.string().min(1).max(100),

  // the root's nickname
  nickname: z.string().min(1).max(100),

  // the password to authenticate the root account. This password cannot be changed
  password: z.string().min(1).max(100000),

  // the secret that will be used to generate OTP tokens for the root account
  otpSecret: z.string().min(1).max(100),
});
type IRootAccountConfig = z.infer<typeof RootAccountSchema>;

/**
 * Telegram
 * The configuration that will be used to initialize the Telegram instance in order to be able to
 * send messages. If Telegram is not integrated, the token property will be an empty string while
 * the chatID will be equals to 0.
 */
const TelegramSchema = z.optional(z.object({
  // the token used to managed BalancerBot via HTTP
  token: z.string(),

  // the id of the group in which all notifications will be broadcasted to
  chatID: z.number(),
}));
type ITelegramConfig = z.infer<typeof TelegramSchema>;

/**
 * JWT Secret
 * The secrets that will be used to generate Access and Refresh Tokens.
 */
const JWTSecretSchema = z.object({
  // the secret that will be used to generate refresh tokens
  refresh: z.string().min(1).max(100000),

  // the secret that will be used to generate access tokens
  access: z.string().min(1).max(100000),
});
type IJWTSecretConfig = z.infer<typeof JWTSecretSchema>;

/**
 * Environment
 * The object that contains all the environment variables required by the API.
 */
const EnvironmentSchema = z.object({
  // the kind of environment the API was started with
  NODE_ENV: NodeEnvSchema,

  // if enabled, the server will be setup with the sole purpose of running unit & integration tests
  TEST_MODE: z.boolean(),

  // if enabled, the server will be setup with the sole purpose of restoring the database
  RESTORE_MODE: z.boolean(),

  // the port that will be exposed publicly by the server
  API_PORT: z.number().min(1).max(100000),

  // the configuration that will be used to establish the connection with postgres
  POSTGRES_HOST: z.string().min(1).max(1000),
  POSTGRES_USER: z.string().min(1).max(1000),
  POSTGRES_DB: z.string().min(1).max(1000),
  POSTGRES_PORT: z.number().min(1).max(100000),
  POSTGRES_PASSWORD_FILE: z.string().min(1).max(100000),

  // the only account that can have an authority of 5 in Balancer
  ROOT_ACCOUNT: RootAccountSchema,

  // the configuration that will be used to initialize telegram (optionally)
  TELEGRAM: TelegramSchema,

  // the secret that will be used to sign Altcha Challenges with HMAC
  ALTCHA_SECRET: z.string().min(1).max(100000),

  // the secrets that will be used to generate access and refresh auth tokens
  JWT_SECRET: JWTSecretSchema,
});
type IEnvironment = z.infer<typeof EnvironmentSchema>;





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  type INodeEnv,
  type IRootAccountConfig,
  type ITelegramConfig,
  type IJWTSecretConfig,
  EnvironmentSchema,
  type IEnvironment,
};
