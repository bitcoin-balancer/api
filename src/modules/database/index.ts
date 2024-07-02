import pg from 'pg';
import { ENVIRONMENT } from '../shared/environment/index.js';
import { IDatabaseService, ITable, ITableNames } from './types.js';
import { buildTableNames, buildTables, getTableNamesForQuery } from './utils.js';
import { RAW_TABLES } from './raw-tables.js';

/* ************************************************************************************************
 *                                          DATA PARSERS                                          *
 ************************************************************************************************ */

/**
 * This code turns all the raw text from postgres into JavaScript types for node-postgres.
 * More info:
 * - https://github.com/brianc/node-pg-types
 * - https://node-postgres.com/apis/types (under construction)
 */

// Bigint Parsing
pg.types.setTypeParser(20, (val) => parseInt(val, 10));

// Numeric Parsing
pg.types.setTypeParser(1700, (val) => parseFloat(val));





/* ************************************************************************************************
 *                                         IMPLEMENTATION                                         *
 ************************************************************************************************ */
const databaseServiceFactory = (): IDatabaseService => {
  /* **********************************************************************************************
   *                                          PROPERTIES                                          *
   ********************************************************************************************** */

  // the pool's configuration -> https://node-postgres.com/apis/pool
  const __CONFIG: pg.PoolConfig = {
    host: ENVIRONMENT.POSTGRES_HOST,
    user: ENVIRONMENT.POSTGRES_USER,
    password: ENVIRONMENT.POSTGRES_PASSWORD_FILE,
    database: ENVIRONMENT.POSTGRES_DB,
    port: ENVIRONMENT.POSTGRES_PORT,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  };

  // the instance of the pool
  let __pool: pg.Pool;

  // the list of existing tables
  const __tables: ITable[] = buildTables(RAW_TABLES);

  // the table names object
  const __tn: ITableNames = buildTableNames(RAW_TABLES);





  /* **********************************************************************************************
   *                                      DATABASE MANAGEMENT                                     *
   ********************************************************************************************** */

  /**
   * Creates all the tables and indexes in a transaction.
   * @returns Promise<void>
   */
  const createTables = async (): Promise<void> => {
    const client = await __pool.connect();
    try {
      await client.query('BEGIN');
      await Promise.all(__tables.map((table) => client.query(table.sql)));
      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  };

  /**
   * Drops all the tables and indexes in a single query execution.
   * @returns Promise<pg.QueryResult>
   */
  const dropTables = (): Promise<pg.QueryResult> => (
    __pool.query(`DROP TABLE IF EXISTS ${getTableNamesForQuery(__tables)};`)
  );





  /* **********************************************************************************************
   *                                          INITIALIZER                                         *
   ********************************************************************************************** */

  /**
   * Initializes the Database Module.
   * @returns Promise<void>
   */
  const initialize = async (): Promise<void> => {
    // initialize the pool
    __pool = new pg.Pool(__CONFIG);

    // create the tables
    await createTables();

    // ...
  };

  /**
   * Tears down the Database Module.
   * @returns Promise<void>
   */
  const teardown = async () => {
    // if TEST_MODE is enabled, drop all the test tables
    if (ENVIRONMENT.TEST_MODE) {
      await dropTables();
    }

    // end the pool connection
    await __pool.end();

    // ...
  };





  /* **********************************************************************************************
   *                                       DATABASE SUMMARY                                       *
   ********************************************************************************************** */

  // ...




  /* **********************************************************************************************
   *                                         MODULE BUILD                                         *
   ********************************************************************************************** */
  return Object.freeze({
    // properties
    get pool() {
      return __pool;
    },
    get tn() {
      return __tn;
    },

    // database management
    createTables,
    dropTables,

    // initializer
    initialize,
    teardown,
  });
};





/* ************************************************************************************************
 *                                        GLOBAL INSTANCE                                         *
 ************************************************************************************************ */
const DatabaseService = databaseServiceFactory();





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  DatabaseService,
};
