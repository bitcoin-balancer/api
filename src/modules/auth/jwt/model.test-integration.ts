/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import ms from 'ms';
import { describe, afterEach, test, expect, vi } from 'vitest';
import { addDays, subDays } from 'date-fns';
import { encryptData } from '../../shared/encrypt/index.js';
import { IQueryResult } from '../../database/index.js';
import { createUserRecord, deleteAllUserRecords } from '../user/model.js';
import { IUser } from '../user/types.js';
import { sign, verify } from './jwt.js';
import {
  getRefreshTokensByUID,
  listRecordsByUID,
  saveRecord,
  deleteExpiredRecords,
  deleteUserRecords,
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

// mock secret key used to sign and verify tokens
const S = '$some_mock_secret_key';




/* ************************************************************************************************
 *                                            HELPERS                                             *
 ************************************************************************************************ */

// creates a user based on a partial record
const createUser: (user: IUser) => Promise<IQueryResult> = ({
  uid,
  nickname,
  authority,
  password_hash,
  otp_secret,
  event_time,
}: IUser): Promise<IQueryResult> => (
  createUserRecord(uid, nickname, authority, password_hash, otp_secret!, event_time)
);




/* ************************************************************************************************
 *                                             TESTS                                              *
 ************************************************************************************************ */
describe('JWT Model', () => {
  afterEach(async () => {
    await deleteAllUserRecords();
    vi.useRealTimers();
  });

  /* **********************************************************************************************
   *                                             JWT                                              *
   ********************************************************************************************** */
  describe('sign & verify', () => {
    test('can sign and verify a JSON Web Token', async () => {
      for (const user of U) {
        await createUser(user);
        const refreshToken = await sign(user.uid, addDays(Date.now(), 30), S);
        const decodedUID = await verify(refreshToken, S);
        expect(user.uid).toBe(decodedUID);
      }
    });
  });





  /* **********************************************************************************************
   *                                          RETRIEVERS                                          *
   ********************************************************************************************** */
  describe('getRefreshTokensByUID', () => {
    test('can retrieve the list of Refresh JWTs owned by users', async () => {
      await Promise.all(U.map(createUser));
      await Promise.all([
        await saveRecord(U[0].uid, 'some_fake_token-1'),
        await saveRecord(U[0].uid, 'some_fake_token-2'),
        await saveRecord(U[0].uid, 'some_fake_token-3'),
        await saveRecord(U[1].uid, 'some_fake_token-4'),
        await saveRecord(U[1].uid, 'some_fake_token-5'),
        await saveRecord(U[2].uid, 'some_fake_token-6'),
      ]);
      const records = await Promise.all([
        getRefreshTokensByUID(U[0].uid),
        getRefreshTokensByUID(U[1].uid),
        getRefreshTokensByUID(U[2].uid),
      ]);
      expect(records[0].length).toBe(3);
      expect(records[0]).toContain('some_fake_token-1');
      expect(records[0]).toContain('some_fake_token-2');
      expect(records[0]).toContain('some_fake_token-3');
      expect(records[1].length).toBe(2);
      expect(records[1]).toContain('some_fake_token-4');
      expect(records[1]).toContain('some_fake_token-5');
      expect(records[2].length).toBe(1);
      expect(records[2]).toContain('some_fake_token-6');
    });

    test('throws if the user does not have a Refresh JWT', async () => {
      await expect(getRefreshTokensByUID('27d6ed25-c001-4d35-a1e6-a735d844a581')).rejects.toThrowError('4750');
    });
  });





  describe('listRecordsByUID', () => {
    test('can retrieve a list of records by uid in descending order', async () => {
      vi.useFakeTimers();

      await createUser(U[0]);

      const eventTimes: number[] = [Date.now()];
      await saveRecord(U[0].uid, 'some_fake_token');

      await vi.advanceTimersByTimeAsync(TIME_INCREMENT);
      eventTimes.push(Date.now());

      await saveRecord(U[0].uid, 'some_other_fake_token');

      await vi.advanceTimersByTimeAsync(TIME_INCREMENT);
      eventTimes.push(Date.now());

      await saveRecord(U[0].uid, 'final_fake_token');

      const records = await listRecordsByUID(U[0].uid);
      expect(records).toHaveLength(3);
      expect(records).toStrictEqual([
        { uid: U[0].uid, token: 'final_fake_token', event_time: eventTimes[2] },
        { uid: U[0].uid, token: 'some_other_fake_token', event_time: eventTimes[1] },
        { uid: U[0].uid, token: 'some_fake_token', event_time: eventTimes[0] },
      ]);
    });
  });





  /* **********************************************************************************************
   *                                      RECORD MANAGEMENT                                       *
   ********************************************************************************************** */
  describe('saveRecord', () => {
    test('can generate a session for brand new users', async () => {
      for (const user of U) {
        await createUser(user);

        const refreshToken = await sign(user.uid, addDays(Date.now(), 30), S);
        await saveRecord(user.uid, refreshToken);

        const records = await listRecordsByUID(user.uid);
        expect(records).toHaveLength(1);
        expect(records).toStrictEqual([{
          uid: user.uid,
          token: refreshToken,
          event_time: records[0].event_time,
        }]);
      }
    });
  });





  describe('deleteUserRecords', () => {
    test('can delete one or all records for a user', async () => {
      vi.useFakeTimers();
      await createUser(U[0]);
      await saveRecord(U[0].uid, 'some-fake-refresh-token');
      await vi.advanceTimersByTimeAsync(TIME_INCREMENT);
      await saveRecord(U[0].uid, 'some-other-fake-refresh-token');
      await vi.advanceTimersByTimeAsync(TIME_INCREMENT);
      await saveRecord(U[0].uid, 'some-final-fake-refresh-token');
      let records = await listRecordsByUID(U[0].uid);
      expect(records).toHaveLength(3);

      await deleteUserRecords(U[0].uid, 'some-fake-refresh-token');

      records = await listRecordsByUID(U[0].uid);
      expect(records).toHaveLength(2);
      expect(records[0].token).toBe('some-final-fake-refresh-token');
      expect(records[1].token).toBe('some-other-fake-refresh-token');

      await deleteUserRecords(U[0].uid);
      records = await listRecordsByUID(U[0].uid);
      expect(records).toHaveLength(0);
    });
  });





  describe('deleteExpiredRecords', async () => {
    test('can delete all the expired records based on a custom time', async () => {
      vi.useFakeTimers();

      const realDate = new Date();
      const eventTimes: number[] = [];

      vi.setSystemTime(subDays(realDate, 35));
      await createUser(U[0]);
      await saveRecord(U[0].uid, 'some-fake-refresh-token-1');
      eventTimes.push(Date.now());

      vi.setSystemTime(subDays(realDate, 32));
      await saveRecord(U[0].uid, 'some-fake-refresh-token-2');
      eventTimes.push(Date.now());

      vi.setSystemTime(subDays(realDate, 27));
      await saveRecord(U[0].uid, 'some-fake-refresh-token-3');
      eventTimes.push(Date.now());

      vi.setSystemTime(subDays(realDate, 6));
      await saveRecord(U[0].uid, 'some-fake-refresh-token-4');
      eventTimes.push(Date.now());

      vi.setSystemTime(realDate);
      await saveRecord(U[0].uid, 'some-fake-refresh-token-5');
      eventTimes.push(Date.now());

      await expect(listRecordsByUID(U[0].uid)).resolves.toHaveLength(5);

      await deleteExpiredRecords(subDays(realDate, 31).getTime());

      const records = await listRecordsByUID(U[0].uid);
      expect(records).toHaveLength(3);
      expect(records).toStrictEqual([
        { uid: U[0].uid, token: 'some-fake-refresh-token-5', event_time: eventTimes.at(-1) },
        { uid: U[0].uid, token: 'some-fake-refresh-token-4', event_time: eventTimes.at(-2) },
        { uid: U[0].uid, token: 'some-fake-refresh-token-3', event_time: eventTimes.at(-3) },
      ]);
    });
  });
});
