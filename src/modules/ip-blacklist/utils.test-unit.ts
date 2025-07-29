import { describe, test, expect } from 'vitest';
import { sanitizeIP, sanitizeRecordData } from './utils.js';

/* ************************************************************************************************
 *                                             TESTS                                              *
 ************************************************************************************************ */
describe('sanitizeIP', () => {
  test.each([
    ['192.168.0.1', '192.168.0.1'],
    ['192 . 168 . 0 . 12', '192.168.0.12'],
    ['199.115.195.106', '199.115.195.106'],
    [' 199 .115.195. 106 ', '199.115.195.106'],
    ['FFFF:192.168.0.1', 'ffff:192.168.0.1'],
    [' FFFF: 192.168.0 . 1 ', 'ffff:192.168.0.1'],
  ])('sanitizeIP(%s) -> %s', (a, expected) => {
    expect(sanitizeIP(a)).toBe(expected);
  });
});

describe('sanitizeRecordData', () => {
  test.each([
    ['192.168.0.1', 'Hello world!', { sanitizedIP: '192.168.0.1', sanitizedNotes: 'Hello world!' }],
    [
      ' FFFF: 192.168.0 . 1',
      'Hello world!',
      { sanitizedIP: 'ffff:192.168.0.1', sanitizedNotes: 'Hello world!' },
    ],
    ['192.168.0.1', undefined, { sanitizedIP: '192.168.0.1', sanitizedNotes: undefined }],
    ['192.168.0.1', '', { sanitizedIP: '192.168.0.1', sanitizedNotes: undefined }],
  ])('sanitizeRecordData(%s, %s) -> %o', (a, b, expected) => {
    expect(sanitizeRecordData(a, b)).toStrictEqual(expected);
  });
});
