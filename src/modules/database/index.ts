import { Pool, PoolConfig, types } from 'pg';
import { ENVIRONMENT } from '../shared/environment/index.js';
import { IDatabaseService, ITable } from './types.js';
import { buildTables } from './utils.js';
import { TABLES } from './tables.js';



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

  // the pool's configuration
  const __CONFIG: PoolConfig = {
    host: ENVIRONMENT.POSTGRES_HOST,
    user: ENVIRONMENT.POSTGRES_USER,
    password: ENVIRONMENT.POSTGRES_PASSWORD_FILE,
    database: ENVIRONMENT.POSTGRES_DB,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
    port: ENVIRONMENT.POSTGRES_PORT,
  };

  // the instance of the pool
  const __pool = new Pool(__CONFIG);

  // the list of existing tables
  const __tables: ITable[] = buildTables(TABLES);



  /* **********************************************************************************************
   *                                            ACTIONS                                           *
   ********************************************************************************************** */

  const someAction = () => {
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

    // actions
    someAction,
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
