import { describe, test, expect } from 'vitest';
import { isTestTableName } from './utils.js';

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
});
