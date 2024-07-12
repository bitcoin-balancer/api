import pg from 'pg';
import { ENVIRONMENT } from '../shared/environment/index.js';
import {
  IDatabaseService,
  IPoolConfig,
  IPool,
  IPoolClient,
  IQueryResult,
  ITableName,
  ITestTableName,
  IDatabaseSummary,
  IDatabaseSummaryTable,
} from './types.js';
import { RAW_TABLES } from './raw-tables.js';
import { buildTableNames, buildTables, getTableNamesForQuery } from './utils.js';

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

/**
 * Database Service Factory
 * Generates the object in charge of managing the initialization and teardown of the PostgreSQL
 * connection. It also manages the instantiation of the Pool and exposes it so other modules can
 * read it directly.
 * @returns IDatabaseService
 */
const databaseServiceFactory = (): IDatabaseService => {
  /* **********************************************************************************************
   *                                          PROPERTIES                                          *
   ********************************************************************************************** */

  // the pool's configuration -> https://node-postgres.com/apis/pool
  const __POOL_CONFIG: IPoolConfig = {
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
  let __pool: IPool | undefined;

  // the list of existing tables
  const __tables = buildTables(RAW_TABLES);

  // the table names object
  const __tn = buildTableNames(RAW_TABLES);





  /* **********************************************************************************************
   *                                      DATABASE MANAGEMENT                                     *
   ********************************************************************************************** */

  /**
   * Creates all the tables and indexes in a transaction.
   * @returns Promise<void>
   */
  const createTables = async (): Promise<void> => {
    const client = await __pool!.connect();
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
   * @returns Promise<IQueryResult>
   */
  const dropTables = (): Promise<IQueryResult> => (
    __pool!.query(`DROP TABLE IF EXISTS ${getTableNamesForQuery(__tables)};`)
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
    __pool = new pg.Pool(__POOL_CONFIG);

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
    await __pool!.end();
    __pool = undefined;

    // ...
  };





  /* **********************************************************************************************
   *                                       DATABASE SUMMARY                                       *
   ********************************************************************************************** */

  /**
   * Retrieves the version of the database being used.
   * @param client
   * @returns Promise<string>
   */
  const __getDatabaseVersion = async (client: IPoolClient): Promise<string> => {
    const { rows } = await client.query('SELECT version();');
    return rows[0].version;
  };

  /**
   * Retrieves the size of the database in bytes.
   * @param client
   * @returns Promise<number>
   */
  const __getDatabaseSize = async (client: IPoolClient): Promise<number> => {
    const { rows } = await client.query(`SELECT pg_database_size('${__POOL_CONFIG.database}');`);
    return rows[0].pg_database_size;
  };

  /**
   * Retrieves the summary for a table.
   * @param name
   * @param client
   * @returns Promise<IDatabaseSummaryTable>
   */
  const __getSummaryTable = async (
    name: ITableName | ITestTableName,
    client: IPoolClient,
  ): Promise<IDatabaseSummaryTable> => {
    const { rows } = await client.query(`SELECT pg_total_relation_size('${name}');`);
    return {
      name,
      size: rows[0].pg_total_relation_size,
    };
  };

  /**
   * Retrieves the summary for all existing tables.
   * @param client
   * @returns Promise<IDatabaseSummaryTable[]>
   */
  const __getAllSummaryTables = (
    client: IPoolClient,
  ): Promise<IDatabaseSummaryTable[]> => Promise.all(
    __tables.map((table) => __getSummaryTable(table.name, client)),
  );

  /**
   * Retrieves the essential database info to get an idea of how things are going from the GUI.
   * @returns Promise<IDatabaseSummary>
   */
  const getDatabaseSummary = async (): Promise<IDatabaseSummary> => {
    // Init the client
    const client = await __pool!.connect();

    // retrieve all the data simultaneously
    try {
      const values = await Promise.all([
        __getDatabaseVersion(client),
        __getDatabaseSize(client),
        __getAllSummaryTables(client),
      ]);

      // finally, return the data
      return {
        name: <string>__POOL_CONFIG.database,
        version: values[0],
        size: values[1],
        port: <number>__POOL_CONFIG.port,
        tables: values[2],
      };
    } finally {
      client.release();
    }
  };





  /* **********************************************************************************************
   *                                         MODULE BUILD                                         *
   ********************************************************************************************** */
  return Object.freeze({
    // properties
    get pool() {
      return <IPool>__pool;
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

    // database summary
    getDatabaseSummary,
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
  // service
  DatabaseService,

  // types
  IQueryResult,
};
