import {
  Pool,
  PoolClient,
  PoolConfig,
  QueryConfig,
  QueryResult,
  Client,
} from 'pg';

/* ************************************************************************************************
 *                                            POSTGRES                                            *
 ************************************************************************************************ */

/**
 * Postgres Types
 * The types for the main postgres modules that will be used in the API.
 */
type IPool = Pool;
type IPoolConfig = PoolConfig;
type IPoolClient = PoolClient;
type IQueryConfig = QueryConfig;
type IQueryResult = QueryResult;
type IClient = Client;





/* ************************************************************************************************
 *                                        DATABASE SERVICE                                        *
 ************************************************************************************************ */

/**
 * Database Service
 * The service in charge of interacting with PostgreSQL.
 */
type IDatabaseService = {

};





/* ************************************************************************************************
 *                                             TABLES                                             *
 ************************************************************************************************ */

/**
 * Table Name
 * Each table has a unique name. However, the API creates a test version of each table to be used in
 * unit and integration tests.
 */
type ITableName = 'users' | 'password_hashes' | 'refresh_tokens' | 'password_updates';
type ITestTableName = `test_${ITableName}`;
type ITableNames = {
  [key in ITableName]: string;
};

/**
 * Raw Table
 * When tables are declared, their name is unknown because if TEST_MODE is enabled, a 'test_' prefix
 * must be included in the name.
 */
type IRawTable = {
  // the raw name of the table
  name: ITableName;

  // the function that will generate the sql needed to create the table
  sql: (tableName: string) => string;
};

/**
 * Table
 * The result of processing a raw table. The value stored in the 'sql' property can be safely
 * executed by postgres.
 */
type ITable = {
  // the name of the table
  name: ITableName | ITestTableName;

  // the result of invoking the sql function in a raw table
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
  name: string;

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
  // postgres
  IPool,
  IPoolConfig,
  IPoolClient,
  IQueryConfig,
  IQueryResult,
  IClient,

  // database service
  IDatabaseService,

  // tables
  IRawTable,
  ITable,
  ITableNames,

  // database summary
  IDatabaseSummaryTable,
  IDatabaseSummary,
};
