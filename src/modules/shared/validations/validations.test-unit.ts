import { describe, test, expect } from 'vitest';
import { IAuthority } from '../../auth/types.js';
import {
  stringValid,
  numberValid,
  usernameValid,
  passwordValid,
  authorityValid,
  otpTokenValid,
} from './validations.js';

/* ************************************************************************************************
 *                                             TESTS                                              *
 ************************************************************************************************ */

describe('stringValid', () => {
  test.each([
    // essential
    ['', undefined, undefined, true],
    [' ', undefined, undefined, true],
    ['Hello World!', undefined, undefined, true],

    // ranges
    ['', 1, undefined, false],
    ['A', 1, undefined, true],
    ['ABCDE', undefined, 5, true],
    ['ABCDEF', undefined, 5, false],
    ['ABCDEF', 1, 5, false],

    // bad data types
    [undefined, undefined, undefined, false],
    [null, undefined, undefined, false],
    [{}, undefined, undefined, false],
    [[], undefined, undefined, false],
    [1, undefined, undefined, false],
    [true, undefined, undefined, false],
  ])('stringValid(%s, %s, %s) -> %s', (a, b, c, expected) => {
    expect(stringValid(<string>a, b, c)).toBe(expected);
  });
});





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
    // valid
    ['jesusgraterol', true],
    ['JESUSGRATEROL', true],
    ['Jes15-Graterol_.', true],
    ['je', true],
    ['15', true],
    ['xD', true],
    ['Herassio-.', true],
    ['PythonWiz333', true],
    ['restAPI12.-_', true],
    ['__', true],

    // invalid
    [undefined, false],
    [null, false],
    [{}, false],
    [[], false],
    ['a', false],
    ['JESUSGRATEROL@', false],
    ['Jes15-Gratero_.!', false],
    ['@@', false],
    ['Jes15-Gratero_.as', false],
    ['jesu()', false],
    ['asdjkhxaslkdj546512asdkasd', false],
    ['', false],
    [' ', false],
    ['   ', false],
  ])('usernameValid(%s) -> %s', (a, expected) => {
    expect(usernameValid(<string>a)).toBe(expected);
  });
});





describe('passwordValid', () => {
  test.each([
    // valid
    ['aaaaaA7!', true],
    ['aA1!aaaaK', true],
    ['Jes15-Graterol_.', true],
    ['Herassio-.5', true],
    ['PythonWiz333@', true],
    ['restAPI12.-_', true],

    // invalid
    [undefined, false],
    [null, false],
    [{}, false],
    [[], false],
    ['a', false],
    ['JESUSGRATEROL@', false],
    ['Jes15-G', false],
    ['@@', false],
    ['jes15-gratero_.as', false],
    ['jesu()', false],
    ['asdjkhxaslkdj546512asdkasd', false],
    ['', false],
    ['          ', false],
    ['12345678', false],
    ['jesSS-gratero_.as', false],
    ['aaaaaaaa', false],
    ['aaaa1111', false],
    ['!!!!!!!!', false],
    ['AAAAAAAA', false],
    ['AAAAAA665', false],
  ])('passwordValid(%s) -> %s', (a, expected) => {
    expect(passwordValid(<string>a)).toBe(expected);
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
