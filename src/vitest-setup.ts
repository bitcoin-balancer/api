import { beforeAll } from 'vitest';
import { ENVIRONMENT } from './modules/shared/environment/index.js';

beforeAll(() => {
  // ensure the API is running on testMode
  if (!ENVIRONMENT.TEST_MODE) {
    throw new Error('The tests can only be executed if testMode is enabled.');
  }

  // ...
});
