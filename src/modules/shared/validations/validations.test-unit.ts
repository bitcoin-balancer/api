import { describe, test, expect } from 'vitest';
import { IAuthority } from '../../auth/user/types.js';
import {
  isAuthorityValid,
  isAltchaPayloadValid,
  isIPValid,
  isIPNotesValid,
  isSymbolValid,
} from './index.js';

/* ************************************************************************************************
 *                                             TESTS                                              *
 ************************************************************************************************ */

describe('isAuthorityValid', () => {
  test.each(<Array<[IAuthority, IAuthority | undefined, boolean]>>[
    // essential
    [0, undefined, false],
    [1, undefined, true],
    [2, undefined, true],
    [3, undefined, true],
    [4, undefined, true],
    [5, undefined, true],
    [6, undefined, false],

    // with a max value
    [5, 4, false],

    // bad data types
    [undefined, undefined, false],
    [null, undefined, false],
    [{}, undefined, false],
    [[{}], undefined, false],
    ['', undefined, false],
    ['5', undefined, false],
    [true, undefined, false],
    [123, undefined, false],
  ])('isAuthorityValid(%s, %s) -> %s', (a, b, expected) => {
    expect(isAuthorityValid(a, b)).toBe(expected);
  });
});





describe('isAltchaPayloadValid', () => {
  test.each([
    // valid
    ['eyJhbGdvcml0aG0iOiJTSEEtMjU2IiwiY2hhbGxlbmdlIjoiMjIzMTFiMDhmY2M0N2VhNGRjMTBhZjkyOGU1Yjg0NDhjMTViZmI5NjExNGRkNjYxYjhhYjA1NjZmNjljZWRhZCIsIm51bWJlciI6ODIzMzQ1LCJzYWx0IjoiODk4YzZlM2I2NTlmMGQyMGYxM2U1MjJkP2V4cGlyZXM9MTcyMTMzMjA1MSIsInNpZ25hdHVyZSI6Ijk2NzY4YzY0NDBkYjAwOGIyYjU2ZmRjM2QyNjVhZDJhZGExMTVlZDhlNTExNjhlZDNhM2FjODM4MTAxMDk1ODkiLCJ0b29rIjo3NTh9', true],
    ['eyJhbGdvcml0aG0iOiJTSEEtMjU2IiwiY2hhbGxlbmdlIjoiZGZjYzk0MmJjZTY0OWRlYzdmZWM4M2U5ZmIwNTcwMjYxNmQ4NDIxZTZlNTU5M2JjOWIzNTE1MTNiMTVmZmRjYiIsIm51bWJlciI6MTU0NzY0LCJzYWx0IjoiY2Y5ZmEyNmQwODQwYzkzZjg0YmU0YzQyP2V4cGlyZXM9MTcyMTMzMjEwNyIsInNpZ25hdHVyZSI6IjM4M2Q3YzkwMzJmZjY1ZWJiOGU1YWViYjQ3ZmUyMjhhYjNkNTQzMjA0NWZmMWJlNGE5NWI5NTM1YWNhYTBlMjMiLCJ0b29rIjoxOTkwfQ==', true],
    ['eyJhbGdvcml0aG0iOiJTSEEtMjU2IiwiY2hhbGxlbmdlIjoiN2MxMWQyNzQzYzQxMmE1NWQ4YWQ2ZmQyOTk0NDlmN2Q0ZDBhMzY2MWE0NjkzODNkMWU4NjYyZDZlZDg1NzFhYiIsIm51bWJlciI6MTIzOTM1LCJzYWx0IjoiNzgxMWI5NGFkNDNkNjZhYWE0NDMwOTgzP2V4cGlyZXM9MTcyMTMzMjExOSIsInNpZ25hdHVyZSI6IjA1MjM4NDQ5ODhiMDQyMjcwM2ExZTQ5NmU5ZmM2OGEzZGViYzhlNmE3OThiN2YyNDYyNTI1N2MwZjM4MzE1NWEiLCJ0b29rIjozOTY2fQ==', true],
    ['eyJhbGdvcml0aG0iOiJTSEEtMjU2IiwiY2hhbGxlbmdlIjoiNmRlYjYxNWJiMWJjYTEzMGU4ZjE3MzBmYTUyNDU0OTJhZDU5MDY0YWFkM2I4ZGIwNjM0NjM5ZDQzYTA2N2U3NyIsIm51bWJlciI6Njc5NzAzLCJzYWx0IjoiZmI1ZDE4YjZhNWE3MWFlZDAyZjFlMDEyP2V4cGlyZXM9MTcyMTMzMjEzNCIsInNpZ25hdHVyZSI6IjlmNmM0OGJkYWJiODYzZjMyYzM0MjQ1YTg2Zjc5NzE1ZGYwNjRlOTI1YjllMGE2YzYxNzcwNzEyNWE2MmQ2ZDEiLCJ0b29rIjozNDk2fQ==', true],
    ['eyJhbGdvcml0aG0iOiJTSEEtMjU2IiwiY2hhbGxlbmdlIjoiYmZlZGNlNjc3OWUwZGJhOTRjMDg0NDliM2ZhZDNiM2RkNmZiNzE5NWJiYTY3NmMzNmMxZjg0NmZjNTM5ZWQ5NiIsIm51bWJlciI6ODYxNzg1LCJzYWx0IjoiZWU0ZWI4ZmMxOGVlNDNhNWVjYWExMmM3P2V4cGlyZXM9MTcyMTMzMjE0MyIsInNpZ25hdHVyZSI6IjBiZGNmYWFmMTgwYTM4OTVmMTNjYjk1ZWEwN2QwM2NhYWFjMjQ5MzVlYzlhNzQ3MDgzYjMxNDEwMjZhZDM4ZWEiLCJ0b29rIjozMTEyfQ==', true],

    // invalid
    ['4565', false],
    [true, false],
    [Array(50).fill('a').join(), false], // ~ 99 characters
    [Array(510).fill('a').join(), false], // ~ 1019 characters
  ])('isAltchaPayloadValid(%s) -> %s', (a, expected) => {
    expect(isAltchaPayloadValid(a)).toBe(expected);
  });
});





describe('isIPValid', () => {
  test.each([
    // valid
    ['192.168.1.1', true],
    ['ffff:192.168.1.1', true],
    ['ffff:192.168.1.1:5465:12', true],
    ['ffff:192.168.1.1:5465:12-_', true],
    ['172.16.20.65', true],
    ['12:12:03:14:fd:7f', true],

    // invalid
    ['4565', false],
    [true, false],
    ['eyJ0eXAiOieyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJPbmxpbmUgSldUIEJ1aWxkZXIiLCJpYXQiOjE3MTk1MjA4MjUsImV4cCI6MTc1MTA1NjgyNSwiYXVkIjoid3d3LmV4YW1wbeyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJPbmxpbmUgSldUIEJ1aWxkZXIiLCJpYXQiOjE3MTk1MjA4MjUsImV4cCI6MTc1MTA1NjgyNSwiYXVkIjoid3d3LmV4YW1wbJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJPbmxpbmUgSldUIEJ1aWxkZXIiLCJpYXQiOjE3MTk1MjA4MjUsImV4cCI6MTc1MTA1NjgyNSwiYXVkIjoid3d3LmV4YW1wb', false],
  ])('isIPValid(%s) -> %s', (a, expected) => {
    expect(isIPValid(a)).toBe(expected);
  });
});





describe('isIPNotesValid', () => {
  test.each([
    // valid
    ['These are some cool notes to be used when banning an ip :)', true],

    // invalid
    ['4565', false],
    [true, false],
    [Array(12600).fill('a').join(), false], // ~ 25200 characters
  ])('isIPNotesValid(%s) -> %s', (a, expected) => {
    expect(isIPNotesValid(a)).toBe(expected);
  });
});





describe('isSymbolValid', () => {
  test.each([
    // valid
    ['BTC', true],
    ['ETH', true],
    ['1INCH', true],
    ['NEO1546212121ASD112', true],

    // invalid
    [undefined, false],
    [null, false],
    [{}, false],
    [[{}], false],
    ['', false],
    ['5^', false],
    ['......', false],
    ['@45654A', false],
    ['a1234567', false],
    [true, false],
    [123456, false],
    [6541, false],
    ['v1.0.0', false],
    ['..', false],
    ['...', false],
    ['a.a.a', false],
    ['BTCCCCCCCCCCCCCCCCCCC', false],
    ['btc', false],
    ['BTc', false],
  ])('isSymbolValid(%s) -> %s', (a, expected) => {
    expect(isSymbolValid(a)).toBe(expected);
  });
});
