import { describe, test, expect } from 'vitest';
import { canRecordsBeListed } from './validations.js';

/* ************************************************************************************************
 *                                             TESTS                                              *
 ************************************************************************************************ */
describe('canRecordsBeListed', () => {
  test('does not throw if the startAtID is not provided', () => {
    expect(canRecordsBeListed(1, undefined)).toBeUndefined();
  });

  test('does not throw if the provided startAtID is valid', () => {
    expect(canRecordsBeListed(1, 1)).toBeUndefined();
    expect(canRecordsBeListed(1, 100)).toBeUndefined();
    expect(canRecordsBeListed(1, Number.MAX_SAFE_INTEGER)).toBeUndefined();
  });

  test.each([
    null,
    {},
    [],
    'someString',
    '1',
    0,
    -100,
    Number.MAX_SAFE_INTEGER + 1,
    NaN,
  ])('canRecordsBeListed(1, %s)', (a) => {
    expect(() => canRecordsBeListed(1, <any>a)).toThrowError('1000');
  });

  test.each([
    null,
    {},
    [],
    'someString',
    '1',
    0,
    -100,
    50,
    Number.MAX_SAFE_INTEGER + 1,
    NaN,
  ])('canRecordsBeListed(%s, 1)', (a) => {
    expect(() => canRecordsBeListed(<any>a, 1)).toThrowError('1001');
  });
});
