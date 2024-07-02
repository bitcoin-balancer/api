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
  uid: z.string().min(1).max(100),
  nickname: z.string().min(1).max(100),
  password: z.string().min(1).max(100000),
  otpSecret: z.string().min(1).max(100),
});
type IRootAccount = z.infer<typeof RootAccountSchema>;

/**
 * Telegram
 * The configuration that will be used to initialize the Telegram instance in order to be able to
 * send messages. If Telegram is not integrated, the env property should be an empty string.
 */
const TelegramSchema = z.optional(z.object({
  token: z.string().min(1).max(200),
  chatID: z.number(),
}));
type ITelegramSchema = z.infer<typeof TelegramSchema>;

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
});
type IEnvironment = z.infer<typeof EnvironmentSchema>;





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  type INodeEnv,
  type IRootAccount,
  type ITelegramSchema,
  EnvironmentSchema,
  type IEnvironment,
};
