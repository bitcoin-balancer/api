import { beforeAll } from 'vitest';
import { ENVIRONMENT } from './modules/shared/environment/environment.js';

beforeAll(() => {
  // ensure the API is running on testMode
  if (!ENVIRONMENT.testMode) {
    throw new Error('The tests can only be executed if testMode is enabled.');
  }

  // ...
});
