import { describe, test, expect } from 'vitest';
import { buildArgs } from './utils.js';

/* ************************************************************************************************
 *                                             TESTS                                              *
 ************************************************************************************************ */
describe('buildArgs', () => {
  test.each([
    [
      { nickname: 'jess', password: '123456', newPassword: '987654' },
      [],
      { nickname: 'jess', password: '123456', newPassword: '987654' },
    ],
    [
      { nickname: 'jess', password: '123456', newPassword: '987654' },
      ['password', 'newPassword'],
      { nickname: 'jess', password: '[SENSITIVE_DATA_HIDDEN]', newPassword: '[SENSITIVE_DATA_HIDDEN]' },
    ],

    // different data types
    [{}, [], undefined],
    [[], [], undefined],
    [[{}], [], undefined],
    ['123', [], undefined],
    [true, [], undefined],
    [123, [], undefined],
  ])('buildArgs(%o, %o) -> %o', (a, b, expected) => {
    expect(buildArgs(<any>a, b)).toStrictEqual(expected);
  });
});
