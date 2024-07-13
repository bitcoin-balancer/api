import { describe, test, expect } from 'vitest';
import { canRecordsBeListed } from './validations.js';

/* ************************************************************************************************
 *                                             TESTS                                              *
 ************************************************************************************************ */
describe('canRecordsBeListed', () => {
  test('does not throw if the startAtID is not provided', () => {
    expect(canRecordsBeListed(undefined)).toBeUndefined();
  });

  test('does not throw if the provided startAtID is valid', () => {
    expect(canRecordsBeListed(1)).toBeUndefined();
    expect(canRecordsBeListed(100)).toBeUndefined();
    expect(canRecordsBeListed(Number.MAX_SAFE_INTEGER)).toBeUndefined();
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
  ])('canRecordsBeListed(%s)', (a) => {
    expect(() => canRecordsBeListed(<any>a)).toThrowError('1000');
  });
});
