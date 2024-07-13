/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import { describe, afterEach, test, expect, vi } from 'vitest';
import { IUser } from './types.js';
import {
  listRecords,
  getUserRecord,
  getUserPasswordHash,
  getUserOTPSecret,
  listUserPasswordUpdateRecords,
  createUserRecord,
  updateUserNickname,
  updateUserAuthority,
  updateUserPasswordHash,
  updateUserOTPSecret,
  deleteUserRecord,
  deleteAllUserRecords,
} from './model.js';
import { IQueryResult } from '../../database/types.js';
import { sortRecords } from '../../shared/utils/index.js';

/* ************************************************************************************************
 *                                           CONSTANTS                                            *
 ************************************************************************************************ */

// list of mock users
const U: IUser[] = [
  { uid: 'a44a6414-7d7a-4b32-8bc1-a5ce7ab96b2e', nickname: 'user-1', authority: 1, password_hash: '$ome_password', otp_secret: 'NFDCMADPEVFEMSIC', event_time: 0 },
  { uid: '99720f31-d944-4e21-a402-b420ed413fed', nickname: 'user-2', authority: 2, password_hash: '$ome_password', otp_secret: 'L5IFQI2EHAYAODTF', event_time: 0 },
  { uid: 'e9a214bb-c4da-4af7-a514-d57bfd91e94e', nickname: 'user-3', authority: 3, password_hash: '$ome_password', otp_secret: 'DEVC63QFD4OS2UKY', event_time: 0 },
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
}: IUser): Promise<IQueryResult> => (
  createUserRecord(uid, nickname, authority, otp_secret!, password_hash!)
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

  describe('getAllRecords', () => {
    test('can retrieve all the records in descending order by authority', async () => {
      await Promise.all(U.map(create));

      // records are ordered descendingly by authority. ensure both lists are the same
      const localRecords: IUser[] = U.slice();
      localRecords.sort(sortRecords('authority', 'desc'));
      let records: IUser[] = await listRecords();
      expect(records).toHaveLength(U.length);
      records.forEach((dbRecord, i) => {
        compareRecords(expect, dbRecord, localRecords[i]);
      });

      await deleteAllUserRecords();
      records = await listRecords();
      expect(records).toHaveLength(0);
    });
  });





  describe('getUserPasswordHash', () => {
    test.todo('can retrieve the password hash for a user', async () => {
      await create(U[0]);
      await expect(getUserPasswordHash(U[0].uid)).resolves.toBe(U[0].password_hash);
    });

    test.todo('throws when attemting to retrieve a password for a uid that doesn\'t exist', async () => {
      await expect(() => getUserOTPSecret(U[0].uid)).rejects.toThrowError('3251');
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
   *                               PASSWORD UPDATE RECORD RETRIEVERS                              *
   ********************************************************************************************** */





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

        await deleteUserRecord(user.uid);
        record = await getUserRecord(user.uid);
        expect(record).toBeUndefined();
      }
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
      await expect(getUserPasswordHash(U[0].uid)).resolves.toBe('NewSecretPasswordHash');
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
});
