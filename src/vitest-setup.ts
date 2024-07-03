import { beforeAll, afterAll } from 'vitest';
import { ENVIRONMENT } from './modules/shared/environment/index.js';
import { DatabaseService } from './modules/database/index.js';

/**
 * Before All
 */
beforeAll(async () => {
  // ensure the API is running on testMode
  if (!ENVIRONMENT.TEST_MODE) {
    throw new Error('The tests can only be executed if testMode is enabled.');
  }

  // initialize the Database Module
  if (!DatabaseService.pool) await DatabaseService.initialize();

  // ...
});



/**
 * After All
 */
afterAll(async () => {
  // teardown the Database Module
  if (DatabaseService.pool) await DatabaseService.teardown();

  // ...
});
