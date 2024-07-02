import { ENVIRONMENT } from '../shared/environment/index.js';
import {
  ITableName,
  ITestTableName,
  ITable,
  IRawTable,
  ITableNames,
} from './types.js';

/* ************************************************************************************************
 *                                       TABLE NAME HELPERS                                       *
 ************************************************************************************************ */

/**
 * Verifies if a value is a test table name.
 * @param name
 * @returns boolean
 */
const isTestTableName = (name: any): name is ITestTableName => (
  typeof name === 'string'
  && /^test_[a-z_]+$/.test(name)
);

/**
 * Converts a table name into the test version. For example: 'my_table' -> 'test_my_table'.
 * @param name
 * @returns ITestTableName
 */
const toTestTableName = (name: ITableName): ITestTableName => (
  isTestTableName(name) ? name : `test_${name}`
);

/**
 * Returns the name of a table that will be used in database queries based on the TEST_MODE.
 * @param name
 * @returns ITableName | ITestTableName
 */
const getTableName = (name: ITableName): ITableName | ITestTableName => (
  ENVIRONMENT.TEST_MODE ? toTestTableName(name) : name
);

/**
 * Joins all of the table names so they can be placed in a SQL Query (e.g. DROP ...)).
 * For example: users, refresh_tokens, password_updates
 * @param tables
 * @returns string
 */
const getTableNamesForQuery = (tables: ITable[]): string => tables.reduce(
  (previous, current, index) => (
    previous + (index === tables.length - 1 ? `${current.name}` : `${current.name}, `)
  ),
  '',
);





/* ************************************************************************************************
 *                                         TABLE BUILDERS                                         *
 ************************************************************************************************ */

/**
 * Converts a raw table into a processed table.
 * @param raw
 * @returns ITable
 */
const __processRawTable = (raw: IRawTable): ITable => {
  const name = getTableName(raw.name);
  return {
    name,
    sql: raw.sql(name),
  };
};

/**
 * Processes a series of raw tables and returns the output.
 * @param rawTables
 * @returns ITable[]
 */
const buildTables = (rawTables: IRawTable[]): ITable[] => rawTables.map(__processRawTable);

/**
 * Builds the table names based on the TEST_MODE. The names stored in this object are the ones to
 * be used to perform database queries.
 * @param rawTables
 * @returns ITableNames
 */
const buildTableNames = (rawTables: IRawTable[]): ITableNames => <ITableNames>rawTables.reduce(
  (previous, current) => ({
    ...previous,
    [current.name]: getTableName(current.name),
  }),
  {},
);





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  // table name helpers
  isTestTableName,
  toTestTableName,
  getTableName,
  getTableNamesForQuery,

  // table builders
  buildTables,
  buildTableNames,
};
