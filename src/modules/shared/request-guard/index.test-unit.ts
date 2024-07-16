import { describe, beforeAll, afterAll, beforeEach, afterEach, test, expect, vi } from 'vitest';
import { IEnvironment } from '../environment/types.js';
import * as ENVIRONMENT from '../environment/index.js';
import { checkPublicRequest } from './index.js';

/* ************************************************************************************************
 *                                           CONSTANTS                                            *
 ************************************************************************************************ */

// test ip address
const IP = '216.24.219.18';





/* ************************************************************************************************
 *                                             MOCKS                                              *
 ************************************************************************************************ */

// mocks the environment file
const mockEnvironment = (value: Partial<IEnvironment>) => vi.spyOn(
  ENVIRONMENT,
  'ENVIRONMENT',
  'get',
).mockReturnValue(<IEnvironment>value);





/* ************************************************************************************************
 *                                             TESTS                                              *
 ************************************************************************************************ */
describe('RequestGuard', () => {
  beforeAll(() => { });

  afterAll(() => { });

  beforeEach(() => { });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('checkRequest', () => {
    test.todo('...');
  });





  describe('checkPublicRequest', () => {
    test('throws if TEST_MODE is enabled', () => {
      mockEnvironment({ TEST_MODE: true });
      expect(() => checkPublicRequest(IP)).toThrowError('6000');
    });

    test('throws if RESTORE_MODE is enabled', () => {
      mockEnvironment({ TEST_MODE: false, RESTORE_MODE: true });
      expect(() => checkPublicRequest(IP)).toThrowError('6001');
    });
  });
});
