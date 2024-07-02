/* eslint-disable @typescript-eslint/no-unused-vars */
import { describe, afterEach, test, expect, vi } from 'vitest';
import * as ENVIRONMENT from '../shared/environment/index.js';
import { getTableName, isTestTableName, toTestTableName } from './utils.js';
import { ITableName } from './types.js';
import { IEnvironment } from '../shared/environment/types.js';

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

describe('Table Name Helpers', () => {
  describe('isTestTableName', () => {
    test.each([
      ['users', false],
      ['refresh_tokens', false],
      ['refresh_tokens_and_more', false],
      ['test_users', true],
      ['test_refresh_tokens', true],
      ['test_refresh_tokens_and_more', true],
    ])('isTestTableName(%s) -> %s', (a, expected) => {
      expect(isTestTableName(a)).toBe(expected);
    });
  });



  describe('toTestTableName', () => {
    test.each([
      ['users', 'test_users'],
      ['refresh_tokens', 'test_refresh_tokens'],
      ['password_updates', 'test_password_updates'],
      ['refresh_tokens_and_more', 'test_refresh_tokens_and_more'],
    ])('toTestTableName(%s) -> %s', (a, expected) => {
      expect(toTestTableName(<ITableName>a)).toBe(expected);
    });
  });



  describe('getTableName', () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    test('it returns the normal table name if TEST_MODE is not enabled', () => {
      const spy = mockEnvironment({ TEST_MODE: false });
      expect(getTableName('users')).toBe('users');
    });

    test('it doesnt add a second prefix if a test table name is passed', () => {
      const spy = mockEnvironment({ TEST_MODE: true });
      expect(getTableName('test_users')).toBe('test_users');
    });

    test('if TEST_MODE is enabled, it converts a table name into the test variant', () => {
      const spy = mockEnvironment({ TEST_MODE: true });
      expect(getTableName('users')).toBe('test_users');
    });
  });
});
