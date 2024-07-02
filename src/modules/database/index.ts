import { types, Pool, PoolConfig } from 'pg';
import { ENVIRONMENT } from '../shared/environment/index.js';
import { IDatabaseService, ITable, ITableNames } from './types.js';
import { buildTableNames, buildTables } from './utils.js';
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
types.setTypeParser(20, (val) => parseInt(val, 10));

// Numeric Parsing
types.setTypeParser(1700, (val) => parseFloat(val));





/* ************************************************************************************************
 *                                         IMPLEMENTATION                                         *
 ************************************************************************************************ */
const databaseServiceFactory = (): IDatabaseService => {
  /* **********************************************************************************************
   *                                          PROPERTIES                                          *
   ********************************************************************************************** */

  // the pool's configuration -> https://node-postgres.com/apis/pool
  const __CONFIG: PoolConfig = {
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
  const __pool = new Pool(__CONFIG);

  // the list of existing tables
  const __tables: ITable[] = buildTables(RAW_TABLES);

  // the table names object
  const __tn: ITableNames = buildTableNames(RAW_TABLES);





  /* **********************************************************************************************
   *                                      DATABASE MANAGEMENT                                     *
   ********************************************************************************************** */

  /**
   * Executes an action on all existing tables.
   * @param action
   * @returns Promise<void>
   */
  const __executeActionOnTables = async (action: 'createSQL' | 'dropSQL'): Promise<void> => {
    const client = await __pool.connect();
    try {
      await client.query('BEGIN');
      await Promise.all(__tables.map((table) => client.query(table[action])));
      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  };

  /**
   * Creates all the tables and indexes in a transaction.
   * @returns Promise<void>
   */
  const createTables = (): Promise<void> => __executeActionOnTables('createSQL');

  /**
   * Drops all the tables and indexes in a transaction.
   * @returns Promise<void>
   */
  const dropTables = (): Promise<void> => __executeActionOnTables('dropSQL');





  /* **********************************************************************************************
   *                                          INITIALIZER                                         *
   ********************************************************************************************** */

  /**
   * Initializes the Database Module.
   * @returns Promise<void>
   */
  const initialize = async (): Promise<void> => {
    // create the tables
    await createTables();

    // ...
  };

  /**
   * Tears down the Database Module.
   * @returns Promise<void>
   */
  const teardown = async () => {
    // end the pool connection
    await __pool.end();

    // ...
  };





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
