import { describe, test, expect } from 'vitest';
import { IAuthority } from '../../auth/user/types.js';
import {
  stringValid,
  numberValid,
  nicknameValid,
  passwordValid,
  authorityValid,
  otpTokenValid,
  jwtValid,
  ipValid,
  ipNotesValid,
  semverValid,
} from './index.js';

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





describe('nicknameValid', () => {
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
  ])('nicknameValid(%s) -> %s', (a, expected) => {
    expect(nicknameValid(<string>a)).toBe(expected);
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
    // valid
    ['123456', true],
    ['000000', true],
    ['987654', true],

    // invalid
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





describe('jwtValid', () => {
  test.each([
    // valid
    ['eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c', true],
    ['eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJncm91cCI6ImFuZHJvaWQiLCJhdWQiOiJhbmRyb2lkIiwiaXNzIjoiYXBpLnNvY2lhbGRlYWwubmwiLCJtZW1iZXIiOnsibmFtZSI6ImVyaWsifSwiZXhwIjoxNDUyMDgzMjA3LCJpYXQiOjE0NTE5OTY4MDd9.u7ZBa9RB8U4QL8eBk4hmsjg8oFW19AHuen12c8CvLMj0IQUsNqeC-vwNQvAINpgBM0bzDf5cotyrUzf55eXch6mzfKMa-OJXguO-lARp4fc40HaBWbfnEvGe7yEgSESkt6gJNuprG51A6f4AJyNlXG_3u7O4bAMwiPZJc3AAU84_JXC7Vlq1X3FMaLVGmZdxzA4TvYZEiTt_KHoA49UgzeZtNXo3YiDq-GgL1eV8Li01fwy-M--xzbp4cPcY89jkPyYxUIJEoITOULr3zXQwRfYVe6i0P28oyu5ZzAwYCajBb2T98zN7sFJarNmtcxSKNfhCPnMVn3wrpxx4_Kd2Pw', true],
    ['eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTIzNDU2Nzg5LCJuYW1lIjoiSm9zZXBoIn0.OpOSSw7e485LOP5PrzScxHb7SR6sAOMRckfFwi4rp7o', true],
    ['eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOiJhYmNkMTIzIiwiZXhwaXJ5IjoxNjQ2NjM1NjExMzAxfQ.3Thp81rDFrKXr3WrY1MyMnNK8kKoZBX9lg-JwFznR-M', true],
    ['eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJPbmxpbmUgSldUIEJ1aWxkZXIiLCJpYXQiOjE3MTk1MjA4MjUsImV4cCI6MTc1MTA1NjgyNSwiYXVkIjoid3d3LmV4YW1wbGUuY29tIiwic3ViIjoianJvY2tldEBleGFtcGxlLmNvbSIsIkdpdmVuTmFtZSI6IkpvaG5ueSIsIlN1cm5hbWUiOiJSb2NrZXQiLCJFbWFpbCI6Impyb2NrZXRAZXhhbXBsZS5jb20iLCJSb2xlIjpbIk1hbmFnZXIiLCJQcm9qZWN0IEFkbWluaXN0cmF0b3IiXX0.mDxqZrLnoLmafT6pUfw2zR-ZtwQWXPsn08aVfMR-le0', true],

    // invalid
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
    ['eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQSflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c', false],
    ['eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9', false],
    ['eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.', false],
    ['eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ', false],
    ['eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.', false],
    ['eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJncm91cCI6ImFuZHJvaWQiLCJhdWQiOiJhbmRyb2lkIiwiaXNzIjoiYXBpLnNvY2lhbGRlYWwubmwiLCJtZW1iZXIiOnsibmFtZSI6ImVyaWsifSwiZXhwIjoxNDUyMDgzMjA3LCJpYXQiOjE0NTE5OTY4MDd9u7ZBa9RB8U4QL8eBk4hmsjg8oFW19AHuen12c8CvLMj0IQUsNqeC-vwNQvAINpgBM0bzDf5cotyrUzf55eXch6mzfKMa-OJXguO-lARp4fc40HaBWbfnEvGe7yEgSESkt6gJNuprG51A6f4AJyNlXG_3u7O4bAMwiPZJc3AAU84_JXC7Vlq1X3FMaLVGmZdxzA4TvYZEiTt_KHoA49UgzeZtNXo3YiDq-GgL1eV8Li01fwy-M--xzbp4cPcY89jkPyYxUIJEoITOULr3zXQwRfYVe6i0P28oyu5ZzAwYCajBb2T98zN7sFJarNmtcxSKNfhCPnMVn3wrpxx4_Kd2Pw', false],
    ['eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJncm91cCI6ImFuZHJvaWQiLCJhdWQiOiJhbmRyb2lkIiwiaXNzIjoiYXBpLnNvY2lhbGRlYWwubmwiLCJtZW1iZXIiOnsibmFtZSI6ImVyaWsifSwiZXhwIjoxNDUyMDgzMjA3LCJpYXQiOjE0NTE5OTY4MDd9', false],
    ['eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.', false],
    ['eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9', false],
    ['a.a.a', false],
    ['!a.a.a', false],
    ['!a.a@.a', false],
    ['!a.a@.a#', false],
    ['a.a.aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', false],
  ])('jwtValid(%s) -> %s', (a, expected) => {
    expect(jwtValid(<string>a)).toBe(expected);
  });
});





describe('ipValid', () => {
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
    ['eyJ0eXAiOieyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJPbmxpbmUgSldUIEJ1aWxkZXIiLCJpYXQiOjE3MTk1MjA4MjUsImV4cCI6MTc1MTA1NjgyNSwiYXVkIjoid3d3LmV4YW1wbeyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJPbmxpbmUgSldUIEJ1aWxkZXIiLCJpYXQiOjE3MTk1MjA4MjUsImV4cCI6MTc1MTA1NjgyNSwiYXVkIjoid3d3LmV4YW1wbJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJPbmxpbmUgSldUIEJ1aWxkZXIiLCJpYXQiOjE3MTk1MjA4MjUsImV4cCI6MTc1MTA1NjgyNSwiYXVkIjoid3d3LmV4YW1wb', false],
  ])('ipValid(%s) -> %s', (a, expected) => {
    expect(ipValid(<string>a)).toBe(expected);
  });
});





describe('ipNotesValid', () => {
  test.each([
    // valid
    ['These are some cool notes to be used when banning an ip :)', true],

    // invalid
    ['4565', false],
    ['eyJ0eXAiOieyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJPbmxpbeyJ0eXAiOieyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJPbmxpbmUgSldUIEJ1aWxkZXIiLCJpYXQiOjE3MTk1MjA4MjUsImV4cCI6MTc1MTA1NjgyNSwiYXVkIjoid3d3LmV4YW1wbeyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJPbmxpbmUgSldUIEJ1aWxkZXIiLCJpYXQiOjE3MTk1MjA4MjUsImV4cCI6MTc1MTA1NjgyNSwiYXVkIjoid3d3LmV4YW1wbJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJPbmxpbmUgSldUIEJ1aWxkZXIiLCJpYXQiOjE3MTk1MjA4MjUsImV4cCI6MTc1MTA1NjgyNSwiYXVkIjoid3d3LmV4YW1wbeyJ0eXAiOieyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJPbmxpbmUgSldUIEJ1aWxkZXIiLCJpYXQiOjE3MTk1MjA4MjUsImV4cCI6MTc1MTA1NjgyNSwiYXVkIjoid3d3LmV4YW1wbeyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJPbmxpbmUgSldUIEJ1aWxkZXIiLCJpYXQiOjE3MTk1MjA4MjUsImV4cCI6MTc1MTA1NjgyNSwiYXVkIjoid3d3LmV4YW1wbJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJPbmxpbmUgSldUIEJ1aWxkZXIiLCJpYXQiOjE3MTk1MjA4MjUsImV4cCI6MTc1MTA1NjgyNSwiYXVkIjoid3d3LmV4YW1wbeyJ0eXAiOieyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJPbmxpbmUgSldUIEJ1aWxkZXIiLCJpYXQiOjE3MTk1MjA4MjUsImV4cCI6MTc1MTA1NjgyNSwiYXVkIjoid3d3LmV4YW1wbeyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJPbmxpbmUgSldUIEJ1aWxkZXIiLCJpYXQiOjE3MTk1MjA4MjUsImV4cCI6MTc1MTA1NjgyNSwiYXVkIjoid3d3LmV4YW1wbJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJPbmxpbmUgSldUIEJ1aWxkZXIiLCJpYXQiOjE3MTk1MjA4MjUsImV4cCI6MTc1MTA1NjgyNSwiYXVkIjoid3d3LmV4YW1wbeyJ0eXAiOieyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJPbmxpbmUgSldUIEJ1aWxkZXIiLCJpYXQiOjE3MTk1MjA4MjUsImV4cCI6MTc1MTA1NjgyNSwiYXVkIjoid3d3LmV4YW1wbeyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJPbmxpbmUgSldUIEJ1aWxkZXIiLCJpYXQiOjE3MTk1MjA4MjUsImV4cCI6MTc1MTA1NjgyNSwiYXVkIjoid3d3LmV4YW1wbJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJPbmxpbmUgSldUIEJ1aWxkZXIiLCJpYXQiOjE3MTk1MjA4MjUsImV4cCI6MTc1MTA1NjgyNSwiYXVkIjoid3d3LmV4YW1wbeyJ0eXAiOieyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJPbmxpbmUgSldUIEJ1aWxkZXIiLCJpYXQiOjE3MTk1MjA4MjUsImV4cCI6MTc1MTA1NjgyNSwiYXVkIjoid3d3LmV4YW1wbeyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJPbmxpbmUgSldUIEJ1aWxkZXIiLCJpYXQiOjE3MTk1MjA4MjUsImV4cCI6MTc1MTA1NjgyNSwiYXVkIjoid3d3LmV4YW1wbJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJPbmxpbmUgSldUIEJ1aWxkZXIiLCJpYXQiOjE3MTk1MjA4MjUsImV4cCI6MTc1MTA1NjgyNSwiYXVkIjoid3d3LmV4YW1wbeyJ0eXAiOieyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJPbmxpbmUgSldUIEJ1aWxkZXIiLCJpYXQiOjE3MTk1MjA4MjUsImV4cCI6MTc1MTA1NjgyNSwiYXVkIjoid3d3LmV4YW1wbeyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJPbmxpbmUgSldUIEJ1aWxkZXIiLCJpYXQiOjE3MTk1MjA4MjUsImV4cCI6MTc1MTA1NjgyNSwiYXVkIjoid3d3LmV4YW1wbJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJPbmxpbmUgSldUIEJ1aWxkZXIiLCJpYXQiOjE3MTk1MjA4MjUsImV4cCI6MTc1MTA1NjgyNSwiYXVkIjoid3d3LmV4YW1wbeyJ0eXAiOieyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJPbmxpbmUgSldUIEJ1aWxkZXIiLCJpYXQiOjE3MTk1MjA4MjUsImV4cCI6MTc1MTA1NjgyNSwiYXVkIjoid3d3LmV4YW1wbeyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJPbmxpbmUgSldUIEJ1aWxkZXIiLCJpYXQiOjE3MTk1MjA4MjUsImV4cCI6MTc1MTA1NjgyNSwiYXVkIjoid3d3LmV4YW1wbJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJPbmxpbmUgSldUIEJ1aWxkZXIiLCJpYXQiOjE3MTk1MjA4MjUsImV4cCI6MTc1MTA1NjgyNSwiYXVkIjoid3d3LmV4YW1wbeyJ0eXAiOieyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJPbmxpbmUgSldUIEJ1aWxkZXIiLCJpYXQiOjE3MTk1MjA4MjUsImV4cCI6MTc1MTA1NjgyNSwiYXVkIjoid3d3LmV4YW1wbeyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJPbmxpbmUgSldUIEJ1aWxkZXIiLCJpYXQiOjE3MTk1MjA4MjUsImV4cCI6MTc1MTA1NjgyNSwiYXVkIjoid3d3LmV4YW1wbJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJPbmxpbmUgSldUIEJ1aWxkZXIiLCJpYXQiOjE3MTk1MjA4MjUsImV4cCI6MTc1MTA1NjgyNSwiYXVkIjoid3d3LmV4YW1wbmUgSldUIEJ1aWxkZXIiLCJpYXQiOjE3MTk1MjA4MjUsImV4cCI6MTc1MTA1NjgyNSwiYXVkIjoid3d3LmV4YW1wbeyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJPbmxpbmUgSldUIEJ1aWxkZXIiLCJpYXQiOjE3MTk1MjA4MjUsImV4cCI6MTc1MTA1NjgyNSwiYXVkIjoid3d3LmV4YW1wbJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJPbmxpbmUgSldUIEJ1aWxkZXIiLCJpYXQiOjE3MTk1MjA4MjUsImV4cCI6MTc1MTA1NjgyNSwiYXVkIjoid3d3LmV4YW1wb', false],
  ])('ipNotesValid(%s) -> %s', (a, expected) => {
    expect(ipNotesValid(<string>a)).toBe(expected);
  });
});





describe('semverValid', () => {
  test.each([
    // valid
    ['1.0.0', true],
    ['10.11.132', true],
    ['17.14.84', true],
    ['1.3.15426', true],

    // invalid
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
    ['v1.0.0', false],
    ['..', false],
    ['...', false],
    ['a.a.a', false],
  ])('semverValid(%s) -> %s', (a, expected) => {
    expect(semverValid(<string>a)).toBe(expected);
  });
});
