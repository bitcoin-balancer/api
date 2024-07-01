import { ENVIRONMENT } from '../environment/environment.js';

/* ************************************************************************************************
 *                                         IMPLEMENTATION                                         *
 ************************************************************************************************ */

/**
 * Ensures the configurations meet all the requirements for the API to be initialized.
 * @throws
 * - If the environment is set to 'production' and the server is being initialized on 'TEST_MODE'
 * - If both, 'TEST_MODE' and 'RESTORE_MODE' are enabled
 */
const canBeInitialized = (): void => {
  if (ENVIRONMENT.NODE_ENV === 'production' && ENVIRONMENT.TEST_MODE) {
    throw new Error('The API could not be initialized because TEST_MODE cannot be enabled when running in a production environment.');
  }
  if (ENVIRONMENT.TEST_MODE && ENVIRONMENT.RESTORE_MODE) {
    throw new Error('The API could not be initialized because TEST_MODE and RESTORE_MODE cannot be enabled simultaneously.');
  }
};





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  canBeInitialized,
};
