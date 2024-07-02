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
const toTestTableName = (name: ITableName): ITestTableName => `test_${name}`;

/**
 * Returns the name of a table that will be used in database queries based on the TEST_MODE.
 * @param name
 * @returns ITableName | ITestTableName
 */
const getTableName = (name: ITableName | ITestTableName): ITableName | ITestTableName => (
  ENVIRONMENT.TEST_MODE && !isTestTableName(name) ? toTestTableName(name) : name
);





/* ************************************************************************************************
 *                                         TABLE BUILDERS                                         *
 ************************************************************************************************ */

/**
 * Processes a series of raw tables and returns the output.
 * @param rawTables
 * @returns ITable[]
 */
const buildTables = (rawTables: IRawTable[]): ITable[] => rawTables.map((raw) => [
  { name: raw.name, sql: raw.sql(raw.name) },
  { name: toTestTableName(raw.name), sql: raw.sql(toTestTableName(raw.name)) },
]).flat();

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

  // table builders
  buildTables,
  buildTableNames,
};
