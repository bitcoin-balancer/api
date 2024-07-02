import { IRawTable } from './types.js';
import { getTableName } from './utils.js';

export const RAW_TABLES: IRawTable[] = [
  /* **********************************************************************************************
   *                                             AUTH                                             *
   ********************************************************************************************** */

  /**
   * users
   * every record corresponds to a Balancer user.
   */
  {
    name: 'users',
    createSQL: (tableName: string) => (
      `CREATE TABLE IF NOT EXISTS ${tableName} (
        uid             UUID PRIMARY KEY,
        nickname        VARCHAR(20) NOT NULL UNIQUE,
        authority       SMALLINT NOT NULL,
        password_hash   VARCHAR(100) NULL,
        otp_secret      VARCHAR(100) NOT NULL,
        event_time      BIGINT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS ${tableName}_nickname ON ${tableName}(nickname);`
    ),
    dropSQL: (tableName: string) => `DROP TABLE IF EXISTS ${tableName};`,
  },

  /**
   * refresh_tokens
   * every record corresponds to a user's auth session.
   */
  {
    name: 'refresh_tokens',
    createSQL: (tableName: string) => (
      `CREATE TABLE IF NOT EXISTS ${tableName} (
        uid         UUID REFERENCES ${getTableName('users')}(uid) ON DELETE CASCADE,
        token       VARCHAR(3000) NOT NULL UNIQUE,
        event_time  BIGINT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS ${tableName}_uid ON ${tableName}(uid);
      CREATE INDEX IF NOT EXISTS ${tableName}_token ON ${tableName}(token);`
    ),
    dropSQL: (tableName: string) => `DROP TABLE IF EXISTS ${tableName};`,
  },

  /**
   * password_updates
   * every record corresponds to a time the user updated their password.
   */
  {
    name: 'password_updates',
    createSQL: (tableName: string) => (
      `CREATE TABLE IF NOT EXISTS ${tableName} (
        uid         UUID REFERENCES ${getTableName('users')}(uid) ON DELETE CASCADE,
        event_time  BIGINT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS ${tableName}_uid ON ${tableName}(uid);`
    ),
    dropSQL: (tableName: string) => `DROP TABLE IF EXISTS ${tableName};`,
  },
];
