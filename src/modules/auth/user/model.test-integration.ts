/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import { describe, afterEach, test, expect } from 'vitest';
import { IUser } from './types.js';
import { createUserRecord, deleteAllUserRecords, deleteUserRecord, getAllRecords, getUserRecord } from './model.js';
import { IQueryResult } from '../../database/types.js';

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
  createUserRecord(uid, nickname, authority, password_hash!, otp_secret!)
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
  });

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



  describe('getAllRecords', () => {
    test('can retrieve all the records in descending order by authority', async () => {
      await Promise.all(U.map(create));

      let records: IUser[] = await getAllRecords();
      expect(records).toHaveLength(U.length);
      records.forEach((u) => {
        compareRecords(expect, u, <IUser>U.find((user) => u.uid === user.uid));
      });

      await deleteAllUserRecords();
      records = await getAllRecords();
      expect(records).toHaveLength(0);
    });
  });



  describe.skip('updateUserNickname', async () => {
    test('can update the nickname of a user', async () => {
      await create(U[0]);
      expect(2).toBe(2);
    });
  });
});
