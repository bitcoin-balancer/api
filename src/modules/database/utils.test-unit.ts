import { describe, test, expect } from 'vitest';
import { isTestTableName, getTestTableName } from './utils.js';
import { ITableName } from './types.js';

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



  describe('getTestTableName', () => {
    test.each([
      ['users', 'test_users'],
      ['refresh_tokens', 'test_refresh_tokens'],
      ['password_updates', 'test_password_updates'],
      ['refresh_tokens_and_more', 'test_refresh_tokens_and_more'],
    ])('getTestTableName(%s) -> %s', (a, expected) => {
      expect(getTestTableName(<ITableName>a)).toBe(expected);
    });
  });
});
