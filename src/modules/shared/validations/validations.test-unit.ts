import { describe, test, expect } from 'vitest';
import { IAuthority } from '../../auth/types.js';
import {
  usernameValid,
  passwordValid,
  authorityValid,
} from './validations.js';

/* ************************************************************************************************
 *                                             TESTS                                              *
 ************************************************************************************************ */

describe('usernameValid', () => {
  test.each([
    'jesusgraterol', 'JESUSGRATEROL', 'Jes15-Graterol_.', 'je', '15', 'xD', '__', 'Herassio-.',
    'PythonWiz333', 'restAPI12.-_',
  ])('usernameValid(%s) -> true', (a) => {
    expect(usernameValid(a)).toBe(true);
  });

  test.each([
    undefined, null, {}, [], 'a', 'JESUSGRATEROL@', 'Jes15-Gratero_.!', '@@', 'Jes15-Gratero_.as',
    'jesu()', 'asdjkhxaslkdj546512asdkasd', '', ' ', '   ',
  ])('usernameValid(%s) -> false', (a) => {
    expect(usernameValid(<string>a)).toBe(false);
  });
});





describe('passwordValid', () => {
  test.each([
    'aaaaaA7!', 'aA1!aaaaK', 'Jes15-Graterol_.', 'Herassio-.5', 'PythonWiz333@', 'restAPI12.-_',
  ])('passwordValid(%s) -> true', (a) => {
    expect(passwordValid(a)).toBe(true);
  });

  test.each([
    undefined, null, {}, [], 'a', 'JESUSGRATEROL@', 'Jes15-G', '@@', 'jes15-gratero_.as',
    'jesu()', 'asdjkhxaslkdj546512asdkasd', '', '          ', '12345678', 'jesSS-gratero_.as',
    'aaaaaaaa', 'aaaa1111', '!!!!!!!!', 'AAAAAAAA', 'AAAAAA665',
  ])('passwordValid(%s) -> false', (a) => {
    expect(passwordValid(<string>a)).toBe(false);
  });
});





describe('authorityValid', () => {
  test.each([
    // essential
    [0, false],
    [1, true],
    [2, true],
    [3, true],
    [4, true],
    [5, true],
    [6, false],

    // bad data types
    [undefined, false],
    [null, false],
    [{}, false],
    [[{}], false],
    ['', false],
    ['5', false],
    [true, false],
  ])('authorityValid(%s) -> %s', (a, expected) => {
    expect(authorityValid(<IAuthority>a)).toBe(expected);
  });
});
