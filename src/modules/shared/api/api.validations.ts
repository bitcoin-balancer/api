import { ENVIRONMENT } from '../environment/environment.js';

/* ************************************************************************************************
 *                                         IMPLEMENTATION                                         *
 ************************************************************************************************ */

/**
 * Ensures the configurations meet all the requirements for the server to be initialized.
 * @throws
 * - If the environment is set to 'production' and the server is being initialized on 'testMode'
 * - If both, 'testMode' and 'restoreMode' are enabled
 */
const canBeInitialized = (): void => {
  if (ENVIRONMENT.environment === 'production' && ENVIRONMENT.testMode) {
    throw new Error('The server could not be setup because testMode cannot be enabled when running in a production environment.');
  }
  if (ENVIRONMENT.testMode && ENVIRONMENT.restoreMode) {
    throw new Error('The server could not be setup because testMode and restoreMode cannot be enabled simultaneously.');
  }
};





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  canBeInitialized,
};
