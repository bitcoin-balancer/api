import { IRawTable } from './types.js';

export const TABLES: IRawTable[] = [
  /* **********************************************************************************************
   *                                             AUTH                                             *
   ********************************************************************************************** */

  /**
   * users
   * every record corresponds to a Balancer user.
   */
  {
    name: 'users',
    sql: (tableName: string) => (
      `CREATE TABLE IF NOT EXIST ${tableName} (
        uid             UUID PRIMARY KEY,
        nickname        VARCHAR(20) NOT NULL UNIQUE,
        authority       SMALLINT NOT NULL,
        password_hash   VARCHAR(100) NULL,
        otp_secret      VARCHAR(100) NOT NULL,
        event_time      BIGINT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS ${tableName}_nickname ON ${tableName}(nickname);`
    ),
  },

  /**
   * refresh_tokens
   * 
   */
/*   {
    name: 'refresh_tokens',
    sql: (name: string) => (
      ``
    ),
  }, */

  /**
   * password_updates
   * every record corresponds to a time the user updated their password.
   */
  /* THE SQL FUNC NEEDS ACCESS TO ALL DYNAMIC TABLE NAMES SO THE IMPLEMENTATION BELOW CAN BE:
        uid UUID REFERENCES ${tableNames.users}(uid) ON DELETE CASCADE,
  { 
    name: 'password_updates',
    sql: (tableName: string) => (
      `CREATE TABLE IF NOT EXIST ${tableName} (
        uid         UUID REFERENCES users(uid) ON DELETE CASCADE,
        event_time  BIGINT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS ${tableName}_uid ON ${tableName}(uid);`
    ),
  },*/
];
