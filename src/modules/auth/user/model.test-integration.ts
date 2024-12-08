/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import ms from 'ms';
import { describe, beforeEach, afterEach, test, expect, vi } from 'vitest';
import { sortRecords } from 'web-utils-kit';
import { encryptData } from '../../shared/encrypt/index.js';
import { IQueryResult } from '../../database/types.js';
import {
  saveRecord as saveRefreshTokenRecord,
  listRecordsByUID as listRefreshTokenRecordsByUID,
} from '../jwt/model.js';
import { IUser } from './types.js';
import {
  listUserRecords,
  getUserRecord,
  getUserRecordByNickname,
  nicknameExists,
  getUserOTPSecret,
  getUserSignInDataByNickname,
  listUserPasswordUpdateRecords,
  createUserRecord,
  updateUserNickname,
  updateUserAuthority,
  updateUserPasswordHash,
  updateUserOTPSecret,
  deleteUserRecord,
  deleteAllUserRecords,
} from './model.js';

/* ************************************************************************************************
 *                                           CONSTANTS                                            *
 ************************************************************************************************ */

// 1 hour worth of milliseconds in order to simulate actions happening sequentially
const TIME_INCREMENT: number = ms('1 hours');

// list of mock users
const U: IUser[] = [
  { uid: 'a44a6414-7d7a-4b32-8bc1-a5ce7ab96b2e', nickname: 'user-1', authority: 1, password_hash: '$ome_password', otp_secret: encryptData('NFDCMADPEVFEMSIC'), event_time: Date.now() + TIME_INCREMENT },
  { uid: '99720f31-d944-4e21-a402-b420ed413fed', nickname: 'user-2', authority: 2, password_hash: '$ome_password', otp_secret: encryptData('L5IFQI2EHAYAODTF'), event_time: Date.now() + (TIME_INCREMENT * 2) },
  { uid: 'e9a214bb-c4da-4af7-a514-d57bfd91e94e', nickname: 'user-3', authority: 3, password_hash: '$ome_password', otp_secret: encryptData('DEVC63QFD4OS2UKY'), event_time: Date.now() + (TIME_INCREMENT * 3) },
];





/* ************************************************************************************************
 *                                            HELPERS                                             *
 ************************************************************************************************ */

// creates a user based on a partial record
const create: (user: IUser) => Promise<IQueryResult> = ({
  uid,
  nickname,
  authority,
  password_hash,
  otp_secret,
  event_time,
}: IUser): Promise<IQueryResult> => (
  createUserRecord(uid, nickname, authority, password_hash, otp_secret!, event_time)
);

// compares a record that was extracted from the database versus the one used to create it
const compareRecords = (expectFunc: Function, dbRecord: IUser, localRecord: IUser) => {
  expectFunc(dbRecord).toStrictEqual({
    uid: localRecord.uid,
    nickname: localRecord.nickname,
    authority: localRecord.authority,
    event_time: dbRecord.event_time,
  });
};





/* ************************************************************************************************
 *                                             TESTS                                              *
 ************************************************************************************************ */

describe('User Model', () => {
  afterEach(async () => {
    await deleteAllUserRecords();
    vi.useRealTimers();
  });

  /* **********************************************************************************************
   *                                          RETRIEVERS                                          *
   ********************************************************************************************** */

  describe('listUserRecords', () => {
    test('can retrieve all the records in descending order by authority', async () => {
      await Promise.all(U.map(create));

      // records are ordered descendingly by authority. ensure both lists are the same
      const localRecords: IUser[] = U.slice();
      localRecords.sort(sortRecords('authority', 'desc'));
      let records: IUser[] = await listUserRecords();
      expect(records).toHaveLength(U.length);
      records.forEach((dbRecord, i) => {
        compareRecords(expect, dbRecord, localRecords[i]);
      });

      await deleteAllUserRecords();
      records = await listUserRecords();
      expect(records).toHaveLength(0);
    });
  });





  describe('getUserRecordByNickname', () => {
    test('can retrieve a record by nickname', async () => {
      await create(U[0]);
      await expect(getUserRecordByNickname(U[0].nickname)).resolves.toStrictEqual({
        uid: U[0].uid,
        nickname: U[0].nickname,
        authority: U[0].authority,
        event_time: U[0].event_time,
      });
    });

    test('the check is case insensitive', async () => {
      await create(U[0]);
      await expect(getUserRecordByNickname(U[0].nickname.toUpperCase())).resolves.toStrictEqual({
        uid: U[0].uid,
        nickname: U[0].nickname,
        authority: U[0].authority,
        event_time: U[0].event_time,
      });
    });

    test('throws if the nickname doesn\'t exist', async () => {
      await expect(() => getUserRecordByNickname(U[0].nickname)).rejects.toThrowError('3252');
    });
  });





  describe('nicknameExists', () => {
    test('can check if a nickname is being used', async () => {
      await expect(nicknameExists(U[0].nickname)).resolves.toBe(false);
      await create(U[0]);
      await expect(nicknameExists(U[0].nickname)).resolves.toBe(true);
    });

    test('the check is case insensitive', async () => {
      await create(U[0]);
      await expect(nicknameExists(U[0].nickname.toUpperCase())).resolves.toBe(true);
    });
  });





  describe('getUserSignInDataByNickname', () => {
    test('can retrieve the sign in data for a user', async () => {
      await create(U[0]);
      await expect(getUserSignInDataByNickname(U[0].nickname)).resolves.toStrictEqual({
        uid: U[0].uid,
        password_hash: U[0].password_hash,
        otp_secret: U[0].otp_secret,
      });
    });

    test('throws when attemting to retrieve the sign in data for a uid that doesn\'t exist', async () => {
      await expect(() => getUserSignInDataByNickname(U[0].nickname)).rejects.toThrowError('3253');
    });

    test('throws when attemting to retrieve the sign in data for a uid that hasn\'t set a password', async () => {
      await createUserRecord(
        U[0].uid,
        U[0].nickname,
        U[0].authority,
        undefined,
        U[0].otp_secret!,
        U[0].event_time,
      );
      await expect(() => getUserSignInDataByNickname(U[0].nickname)).rejects.toThrowError('3251');
    });
  });




  describe('getUserOTPSecret', () => {
    test('can retrieve the OTP Secret for a user', async () => {
      await create(U[0]);
      await expect(getUserOTPSecret(U[0].uid)).resolves.toBe(U[0].otp_secret);
    });

    test('throws when attempting to retrieve a secret for a uid that doesn\t exist', async () => {
      await expect(() => getUserOTPSecret(U[0].uid)).rejects.toThrowError('3250');
    });
  });





  /* **********************************************************************************************
   *                                  PASSWORD UPDATE RETRIEVERS                                  *
   ********************************************************************************************** */
  describe('listUserPasswordUpdateRecords', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    test('can update the password several times for a user and retrieve the records in order', async () => {
      await create(U[0]);

      const eventTimes: number[] = [Date.now()];

      let records = await listUserPasswordUpdateRecords(U[0].uid, 10);
      expect(records).toHaveLength(0);

      await updateUserPasswordHash(U[0].uid, 'NEW_PASSWORD');
      records = await listUserPasswordUpdateRecords(U[0].uid, 10);
      expect(records).toHaveLength(1);
      expect(records[0]).toStrictEqual({ uid: U[0].uid, event_time: eventTimes[0] });

      await vi.advanceTimersByTimeAsync(TIME_INCREMENT);
      eventTimes.push(Date.now());

      await updateUserPasswordHash(U[0].uid, 'NEW_PASSWORD_2');
      records = await listUserPasswordUpdateRecords(U[0].uid, 10);
      expect(records).toHaveLength(2);
      expect(records[0]).toStrictEqual({ uid: U[0].uid, event_time: eventTimes[1] });

      await vi.advanceTimersByTimeAsync(TIME_INCREMENT);
      eventTimes.push(Date.now());

      await updateUserPasswordHash(U[0].uid, 'NEW_PASSWORD_3');
      records = await listUserPasswordUpdateRecords(U[0].uid, 10);
      expect(records).toHaveLength(3);
      expect(records[0]).toStrictEqual({ uid: U[0].uid, event_time: eventTimes[2] });
    });

    test('can list any number of records and then load the next ones', async () => {
      create(U[0]);

      const eventTimes: number[] = [];

      for (let i = 0; i < 10; i += 1) {
        await updateUserPasswordHash(U[0].uid, 'NEW_PASSWORD');
        eventTimes.push(Date.now());
        await vi.advanceTimersByTimeAsync(TIME_INCREMENT);
      }

      eventTimes.reverse();

      const batch1 = await listUserPasswordUpdateRecords(U[0].uid, 3);
      expect(batch1).toHaveLength(3);

      const batch2 = await listUserPasswordUpdateRecords(U[0].uid, 2, batch1.at(-1)!.event_time);
      expect(batch2).toHaveLength(2);

      const batch3 = await listUserPasswordUpdateRecords(U[0].uid, 5, batch2.at(-1)!.event_time);
      expect(batch3).toHaveLength(5);

      [...batch1, ...batch2, ...batch3].forEach((record, i) => {
        expect(record).toStrictEqual({ uid: U[0].uid, event_time: eventTimes[i] });
      });
    });
  });





  /* **********************************************************************************************
   *                                    USER RECORD MANAGEMENT                                    *
   ********************************************************************************************** */
  describe('createUserRecord', () => {
    test('can create a series of users, validate their integrity and delete them', async () => {
      for (const user of U) {
        await create(user);

        let record = await getUserRecord(user.uid);
        expect(record).toBeDefined();
        compareRecords(expect, record!, user);

        await expect(getUserSignInDataByNickname(user.nickname)).resolves.toStrictEqual({
          uid: user.uid,
          password_hash: user.password_hash,
          otp_secret: user.otp_secret,
        });

        await deleteUserRecord(user.uid);
        record = await getUserRecord(user.uid);
        expect(record).toBeUndefined();
      }
    });

    test('can create a user without providing a password to start with', async () => {
      await createUserRecord(
        U[0].uid,
        U[0].nickname,
        U[0].authority,
        undefined,
        U[0].otp_secret!,
        U[0].event_time,
      );

      const record = await getUserRecord(U[0].uid);
      expect(record).toBeDefined();
      compareRecords(expect, record!, U[0]);

      await expect(getUserOTPSecret(U[0].uid)).resolves.toBe(U[0].otp_secret);

      await expect(() => getUserSignInDataByNickname(U[0].nickname)).rejects.toThrowError('3251');

      await updateUserPasswordHash(U[0].uid, '$NEW_PASSWORD');
      await expect(getUserSignInDataByNickname(U[0].nickname)).resolves.toStrictEqual({
        uid: U[0].uid,
        password_hash: '$NEW_PASSWORD',
        otp_secret: U[0].otp_secret,
      });
    });
  });




  describe('updateUserNickname', async () => {
    test('can update the user\'s nickname', async () => {
      await create(U[0]);
      await updateUserNickname(U[0].uid, 'NewNickname');
      const record = await getUserRecord(U[0].uid);
      expect(record).toBeDefined();
      expect(record!.nickname).toBe('NewNickname');
    });
  });




  describe('updateUserAuthority', async () => {
    test('can update the user\'s authority', async () => {
      await create(U[0]);
      await updateUserAuthority(U[0].uid, 5);
      const record = await getUserRecord(U[0].uid);
      expect(record).toBeDefined();
      expect(record!.authority).toBe(5);
    });
  });




  describe('updateUserPasswordHash', async () => {
    test('can update the user\'s password', async () => {
      await create(U[0]);
      await updateUserPasswordHash(U[0].uid, 'NewSecretPasswordHash');
      await expect(getUserSignInDataByNickname(U[0].nickname)).resolves.toStrictEqual({
        uid: U[0].uid,
        password_hash: 'NewSecretPasswordHash',
        otp_secret: U[0].otp_secret,
      });
      const records = await listUserPasswordUpdateRecords(U[0].uid, 10);
      expect(records).toHaveLength(1);
      expect(records[0].uid).toBe(U[0].uid);
    });
  });




  describe('updateUserOTPSecret', async () => {
    test('can update the user\'s  OTP Secret', async () => {
      await create(U[0]);
      await updateUserOTPSecret(U[0].uid, 'NEWSECRET');
      await expect(getUserOTPSecret(U[0].uid)).resolves.toBe('NEWSECRET');
    });
  });





  describe('deleteUserRecord', () => {
    test('when an user is deleted, it also deletes the password_updates & refresh_tokens records', async () => {
      await create(U[0]);
      await updateUserPasswordHash(U[0].uid, 'NewSecretPasswordHash');
      await updateUserPasswordHash(U[0].uid, 'NewSecretPasswordHash');

      let passwordUpdateRecords = await listUserPasswordUpdateRecords(U[0].uid, 15);
      expect(passwordUpdateRecords).toHaveLength(2);

      await saveRefreshTokenRecord(U[0].uid, 'Some fake refresh token');
      await saveRefreshTokenRecord(U[0].uid, 'Some other fake refresh token');
      await saveRefreshTokenRecord(U[0].uid, 'Last fake refresh token');
      let refreshTokenRecords = await listRefreshTokenRecordsByUID(U[0].uid);
      expect(refreshTokenRecords).toHaveLength(3);

      await deleteUserRecord(U[0].uid);
      passwordUpdateRecords = await listUserPasswordUpdateRecords(U[0].uid, 15);
      expect(passwordUpdateRecords).toHaveLength(0);

      refreshTokenRecords = await listRefreshTokenRecordsByUID(U[0].uid);
      expect(refreshTokenRecords).toHaveLength(0);
    });
  });
});
