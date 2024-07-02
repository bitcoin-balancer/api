import { Pool } from 'pg';

/* ************************************************************************************************
 *                                        DATABASE SERVICE                                        *
 ************************************************************************************************ */

/**
 * Database Service
 * The service in charge of interacting with PostgreSQL.
 */
type IDatabaseService = {
  // properties
  pool: Pool;
  tn: ITableNames;

  // database management
  createTables: () => Promise<void>;
  dropTables: () => Promise<void>;

  // initializer
  initialize: () => Promise<void>;
  teardown: () => Promise<void>;
};





/* ************************************************************************************************
 *                                             TABLES                                             *
 ************************************************************************************************ */

/**
 * Table Name
 * Each table has a unique name. However, the API creates a test version of each table to be used in
 * unit and integration tests.
 */
type ITableName = 'users' | 'refresh_tokens' | 'password_updates';
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

  // the functions that will generate the SQL to create or drop the table
  createSQL: (tableName: string) => string;
  dropSQL: (tableName: string) => string;
};

/**
 * Table
 * The result of processing a raw table. The value stored in the 'sql' property can be safely
 * executed by postgres.
 */
type ITable = {
  // the name of the table
  name: ITableName | ITestTableName;

  // the SQL that will create or drop the table
  createSQL: string;
  dropSQL: string;
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
  // database service
  IDatabaseService,

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
