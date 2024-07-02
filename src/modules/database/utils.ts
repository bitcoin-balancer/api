import { ENVIRONMENT } from '../shared/environment/index.js';
import { ITableName, ITestTableName } from './types.js';

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
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  // table name helpers
  isTestTableName,
  toTestTableName,
  getTableName,
};
