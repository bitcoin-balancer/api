import { IRawTable } from './types.js';
import { getTableName } from './utils.js';

export const RAW_TABLES: IRawTable[] = [
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
   * notifications
   * every record corresponds to an important event that was broadcasted to all users.
   */
  {
    name: 'notifications',
    sql:
      `CREATE TABLE IF NOT EXISTS ${getTableName('notifications')} (
        id          BIGSERIAL PRIMARY KEY,
        sender      VARCHAR(500) NOT NULL,
        title       VARCHAR(500) NOT NULL,
        description VARCHAR(3000) NOT NULL,
        event_time  BIGINT NOT NULL
      );`,
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

  /**
   * event_candlesticks
   * every record corresponds to the full history of an event in OHLC format.
   */
  {
    name: 'event_candlesticks',
    sql:
      `CREATE TABLE IF NOT EXISTS ${getTableName('event_candlesticks')} (
        id          UUID PRIMARY KEY,
        event       VARCHAR(100) NOT NULL,
        interval    VARCHAR(10) NOT NULL,
        records     JSONB NOT NULL,
        event_time  BIGINT NOT NULL
      );`,
  },

  /**
   * price_crash_states
   * every record corresponds to an individual price crash state.
   */
  {
    name: 'price_crash_states',
    sql:
      `CREATE TABLE IF NOT EXISTS ${getTableName('price_crash_states')} (
        id                    UUID PRIMARY KEY,
        highest_points        NUMERIC(5, 2) NOT NULL,
        final_points          NUMERIC(5, 2) NOT NULL,
        event_time            BIGINT NOT NULL,
        reversal_event_time   BIGINT NULL
      );
      CREATE INDEX IF NOT EXISTS ${getTableName('price_crash_states')}_event_time_idx ON ${getTableName('price_crash_states')}(event_time DESC);`,
  },

  /**
   * trades
   * every record corresponds to an individual trade execution (one order can contain many trade
   * executions).
   */
  {
    name: 'trades',
    sql:
      `CREATE TABLE IF NOT EXISTS ${getTableName('trades')} (
        id            BIGSERIAL PRIMARY KEY,
        id_alt        VARCHAR(500) NULL,
        notes         VARCHAR(50000) NULL,
        side          VARCHAR(10) NOT NULL,
        price         NUMERIC(20, 2) NOT NULL,
        amount        NUMERIC(20, 8) NOT NULL,
        amount_quote  NUMERIC(20, 2) NOT NULL,
        comission     NUMERIC(20, 8) NOT NULL,
        event_time    BIGINT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS ${getTableName('trades')}_event_time_idx ON ${getTableName('trades')}(event_time ASC);`,
  },

  /**
   * positions
   * every record corresponds to an individual trade execution (one order can contain many trade
   * executions).
   */
  {
    name: 'positions',
    sql:
      `CREATE TABLE IF NOT EXISTS ${getTableName('positions')} (
        id                      UUID PRIMARY KEY,
        open                    BIGINT NOT NULL,
        close                   BIGINT NULL,
        entry_price             NUMERIC(20, 2) NOT NULL,
        gain                    NUMERIC(10, 2) NOT NULL,
        amount                  NUMERIC(20, 8) NOT NULL,
        amount_quote            NUMERIC(20, 2) NOT NULL,
        amount_quote_in         NUMERIC(20, 2) NOT NULL,
        amount_quote_out        NUMERIC(20, 2) NOT NULL,
        pnl                     NUMERIC(20, 2) NOT NULL,
        roi                     NUMERIC(10, 2) NOT NULL,
        decrease_price_levels   JSONB NOT NULL,
        increase_actions        JSONB NOT NULL,
        decrease_actions        JSONB NOT NULL
      );
      CREATE INDEX IF NOT EXISTS ${getTableName('positions')}_open_idx ON ${getTableName('positions')}(open DESC);
      CREATE INDEX IF NOT EXISTS ${getTableName('positions')}_close_idx ON ${getTableName('positions')}(close);`,
  },

  /**
   * transactions
   * every record corresponds to an individual trade execution (one order can contain many trade
   * executions).
   */
  {
    name: 'transactions',
    sql:
      `CREATE TABLE IF NOT EXISTS ${getTableName('transactions')} (
        id          BIGSERIAL PRIMARY KEY,
        event_time  BIGINT NOT NULL,
        status      VARCHAR(100) NOT NULL,
        side        VARCHAR(10) NOT NULL,
        amount      NUMERIC(20, 8) NOT NULL,
        logs        JSONB NOT NULL
      );
      CREATE INDEX IF NOT EXISTS ${getTableName('transactions')}_event_time_idx ON ${getTableName('transactions')}(event_time);`,
  },
];
