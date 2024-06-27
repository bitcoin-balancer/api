import { describe, test, expect } from 'vitest';
import { IAuthority } from '../../auth/types.js';
import {
  usernameValid,
  passwordValid,
  authorityValid,
  otpTokenValid,
  numberValid,
} from './validations.js';

/* ************************************************************************************************
 *                                             TESTS                                              *
 ************************************************************************************************ */

describe('numberValid', () => {
  test.each([
    // essential
    [1, undefined, undefined, true],
    [0, undefined, undefined, true],
    [-1, undefined, undefined, true],
    [Infinity, undefined, undefined, true],
    [-Infinity, undefined, undefined, true],
    [NaN, undefined, undefined, true],

    // ranges
    [0, 1, 5, false],
    [1, 1, 5, true],
    [2, 1, 5, true],
    [3, 1, 5, true],
    [4, 1, 5, true],
    [5, 1, 5, true],
    [6, 1, 5, false],
    [NaN, 0, undefined, false],
    [-Infinity, 0, undefined, false],
    [Infinity, undefined, 1, false],

    // bad data types
    [undefined, undefined, undefined, false],
    [null, undefined, undefined, false],
    [{}, undefined, undefined, false],
    [[], undefined, undefined, false],
    ['', undefined, undefined, false],
    ['1', undefined, undefined, false],
  ])('numberValid(%s, %s, %s) -> %s', (a, b, c, expected) => {
    expect(numberValid(<number>a, b, c)).toBe(expected);
  });
});





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





describe('otpTokenValid', () => {
  test.each([
    // essential
    ['123456', true],
    ['000000', true],
    ['987654', true],

    // bad data types
    [undefined, false],
    [null, false],
    [{}, false],
    [[{}], false],
    ['', false],
    ['5', false],
    ['......', false],
    ['45654A', false],
    ['1234567', false],
    [true, false],
    [123456, false],
    [6541, false],
  ])('otpTokenValid(%s) -> %s', (a, expected) => {
    expect(otpTokenValid(<string>a)).toBe(expected);
  });
});
