import { ITableName, ITestTableName } from './types.js';

/* ************************************************************************************************
 *                                       TABLE NAME HELPERS                                       *
 ************************************************************************************************ */

// const getTableName = (): ITableName | ITestTableName => {};

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
 * Converts a table name into the test version.
 * @param name
 * @returns ITestTableName
 */
const getTestTableName = (name: ITableName): ITestTableName => `test_${name}`;




/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  // table name helpers
  isTestTableName,
  getTestTableName,
};
