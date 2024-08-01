import { IRawTable } from './types.js';
import { getTableName } from './utils.js';

export const RAW_TABLES: IRawTable[] = [
  /* **********************************************************************************************
   *                                             AUTH                                             *
   ********************************************************************************************** */

  /**
   * api_errors
   * every record corresponds to an error that was thrown in the API.
   */
  {
    name: 'api_errors',
    sql:
      `CREATE TABLE IF NOT EXISTS ${getTableName('api_errors')} (
        id          BIGSERIAL PRIMARY KEY,
        origin      VARCHAR(500) NOT NULL,
        error       VARCHAR(5000) NOT NULL,
        event_time  BIGINT NOT NULL,
        uid         UUID NULL,
        ip          VARCHAR(500) NULL,
        args        JSONB NULL
      );`,
  },

  /**
   * users
   * every record corresponds to a Balancer user.
   */
  {
    name: 'users',
    sql:
      `CREATE TABLE IF NOT EXISTS ${getTableName('users')} (
        uid             UUID PRIMARY KEY,
        nickname        VARCHAR(20) NOT NULL UNIQUE,
        authority       SMALLINT NOT NULL,
        password_hash   VARCHAR(100) NULL,
        otp_secret      VARCHAR(100) NOT NULL UNIQUE,
        event_time      BIGINT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS ${getTableName('users')}_nickname_idx ON ${getTableName('users')}(LOWER(nickname));`,
  },

  /**
   * password_updates
   * every record corresponds to a time the user updated their password.
   */
  {
    name: 'password_updates',
    sql:
      `CREATE TABLE IF NOT EXISTS ${getTableName('password_updates')} (
        uid         UUID REFERENCES ${getTableName('users')}(uid) ON DELETE CASCADE,
        event_time  BIGINT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS ${getTableName('password_updates')}_uid_event_time_idx ON ${getTableName('password_updates')}(uid, event_time DESC);`,
  },

  /**
   * refresh_tokens
   * every record corresponds to a user's auth session.
   */
  {
    name: 'refresh_tokens',
    sql:
      `CREATE TABLE IF NOT EXISTS ${getTableName('refresh_tokens')} (
        uid         UUID REFERENCES ${getTableName('users')}(uid) ON DELETE CASCADE,
        token       VARCHAR(3000) NOT NULL UNIQUE,
        event_time  BIGINT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS ${getTableName('refresh_tokens')}_uid_token_idx ON ${getTableName('refresh_tokens')}(uid, token);
      CREATE INDEX IF NOT EXISTS ${getTableName('refresh_tokens')}_uid_event_time_idx ON ${getTableName('refresh_tokens')}(uid, event_time DESC);`,
  },

  /**
   * ip_blacklist
   * every record corresponds to an IP Address that has been blacklisted.
   */
  {
    name: 'ip_blacklist',
    sql:
      `CREATE TABLE IF NOT EXISTS ${getTableName('ip_blacklist')} (
        id          BIGSERIAL PRIMARY KEY,
        ip          VARCHAR(500) NOT NULL UNIQUE,
        notes       VARCHAR(25000) NULL,
        event_time  BIGINT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS ${getTableName('ip_blacklist')}_ip_idx ON ${getTableName('ip_blacklist')}(ip);`,
  },

  /**
   * record_store
   * every record corresponds to a unique record that will be store persistently.
   */
  {
    name: 'record_stores',
    sql:
      `CREATE TABLE IF NOT EXISTS ${getTableName('record_stores')} (
        id    VARCHAR(500) PRIMARY KEY,
        value JSONB NOT NULL
      );`,
  },
];
