import pg from 'pg';

/* ************************************************************************************************
 *                                            SERVICE                                             *
 ************************************************************************************************ */

/**
 * Database Service
 * Object in charge of managing the initialization and teardown of the PostgreSQL connection. It
 * also manages the instantiation of the Pool and exposes it so other modules can read it directly.
 */
type IDatabaseService = {
  // properties
  pool: pg.Pool;
  tn: ITableNames;

  // database management
  createTables: () => Promise<void>;
  dropTables: () => Promise<pg.QueryResult>;

  // initializer
  initialize: () => Promise<void>;
  teardown: () => Promise<void>;

  // database summary
  getDatabaseSummary: () => Promise<IDatabaseSummary>;
};





/* ************************************************************************************************
 *                                            PG TYPES                                            *
 ************************************************************************************************ */

// the configuration object used to instantiate a pool
type IPoolConfig = pg.PoolConfig;

// the instance of a pool
type IPool = pg.Pool;

// the instance of a connection to the database
type IPoolClient = pg.PoolClient;

// the result of a query execution
type IQueryResult = pg.QueryResult;


/* ************************************************************************************************
 *                                             TABLES                                             *
 ************************************************************************************************ */

/**
 * Table Name
 * Each table has a unique name. However, the API creates a test version of each table to be used in
 * unit and integration tests.
 */
type ITableName = 'api_errors' | 'users' | 'password_updates' | 'refresh_tokens' | 'ip_blacklist';
type ITestTableName = `test_${ITableName}`;
type ITableNames = {
  [key in ITableName]: ITableName | ITestTableName;
};

/**
 * Raw Table
 * When tables are declared, their name is unknown because if TEST_MODE is enabled, a 'test_' prefix
 * must be included in the name.
 */
type IRawTable = {
  // the raw name of the table
  name: ITableName;

  // the function that will generate the SQL to create the table
  sql: string;
};

/**
 * Table
 * The result of processing a raw table. The value stored in the 'sql' property can be safely
 * executed by postgres.
 */
type ITable = {
  // the name of the table
  name: ITableName | ITestTableName;

  // the SQL that will create the table
  sql: string;
};





/* ************************************************************************************************
 *                                        DATABASE SUMMARY                                        *
 ************************************************************************************************ */

/**
 * Database Summary Table
 * The essential information about an existing table that will be included in the summary.
 */
type IDatabaseSummaryTable = {
  // the name of the table
  name: ITableName | ITestTableName;

  // the total size of the table in bytes
  size: number;
};

/**
 * Database Summary
 * The essential information regarding the state of the database.
 */
type IDatabaseSummary = {
  // the name of the database
  name: string;

  // the version of PostgreSQL
  version: string;

  // the total size of the database in bytes
  size: number;

  // the port in which the database is running
  port: number;

  // the list of tables that comprise the database
  tables: IDatabaseSummaryTable[];
};





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export type {
  // database service
  IDatabaseService,

  // pg types
  IPoolConfig,
  IPool,
  IPoolClient,
  IQueryResult,

  // tables
  IRawTable,
  ITable,
  ITableName,
  ITestTableName,
  ITableNames,

  // database summary
  IDatabaseSummaryTable,
  IDatabaseSummary,
};
