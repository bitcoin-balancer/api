import { describe, beforeAll, afterAll, beforeEach, afterEach, test, expect, vi } from 'vitest';
import { IEnvironment } from '../environment/types.js';
import * as ENVIRONMENT from '../environment/index.js';
import { APIService } from '../api/index.js';
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

// mocks the initialized state of the API
vi.mock('../api/index.js', () => ({
  APIService: {
    initialized: false,
  },
}));
const mockInitializedState = (state: boolean) => (
  vi.spyOn(APIService, 'initialized', 'get').mockReturnValue(state)
);





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
    test('can check a valid public request', () => {
      mockEnvironment({ TEST_MODE: false });
      mockInitializedState(true);
      expect(checkPublicRequest(IP)).toBeUndefined();
    });

    test('can check a valid public request with args', () => {
      mockEnvironment({ TEST_MODE: false });
      mockInitializedState(true);
      expect(checkPublicRequest(IP, ['someArg'], { someArg: 'hello!' })).toBeUndefined();
    });

    test('throws if TEST_MODE is enabled', () => {
      mockEnvironment({ TEST_MODE: true });
      expect(() => checkPublicRequest(IP)).toThrowError('6000');
    });

    test('throws if RESTORE_MODE is enabled', () => {
      mockEnvironment({ TEST_MODE: false, RESTORE_MODE: true });
      expect(() => checkPublicRequest(IP)).toThrowError('6001');
    });

    test('throws if the API has not been initialized', () => {
      mockEnvironment({ TEST_MODE: false });
      mockInitializedState(false);
      expect(() => checkPublicRequest(IP)).toThrowError('6002');
    });

    test('throws if there are required args and an invalid object is passed', () => {
      mockEnvironment({ TEST_MODE: false });
      mockInitializedState(true);
      expect(() => checkPublicRequest(IP, ['someArg'], undefined)).toThrowError('6003');
      expect(() => checkPublicRequest(IP, ['someArg'], null!)).toThrowError('6003');
      expect(() => checkPublicRequest(IP, ['someArg'], {})).toThrowError('6003');
    });

    test('throws if the required arg has an invalid value', () => {
      mockEnvironment({ TEST_MODE: false });
      mockInitializedState(true);
      expect(() => checkPublicRequest(IP, ['someArg'], { someArg: undefined })).toThrowError('6004');
      expect(() => checkPublicRequest(IP, ['someArg'], { someArg: null })).toThrowError('6004');
      expect(() => checkPublicRequest(IP, ['someArg'], { someArg: '' })).toThrowError('6004');
      expect(() => checkPublicRequest(IP, ['someArg'], { someArg: NaN })).toThrowError('6004');
    });
  });
});
