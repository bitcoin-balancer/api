/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import { describe, afterEach, test, expect } from 'vitest';
import { addDays } from 'date-fns';
import { toMilliseconds } from '../../shared/utils/index.js';
import { IQueryResult } from '../../database/index.js';
import { createUserRecord, deleteAllUserRecords } from '../user/model.js';
import { IUser } from '../user/types.js';
import { sign, verify } from './jwt.js';
import { listRecordsByUID, saveRecord } from './model.js';

/* ************************************************************************************************
 *                                           CONSTANTS                                            *
 ************************************************************************************************ */

// 1 hour worth of milliseconds in order to simulate actions happening sequentially
const TIME_INCREMENT: number = toMilliseconds(60 * 60);

// list of mock users
const U: IUser[] = [
  { uid: 'a44a6414-7d7a-4b32-8bc1-a5ce7ab96b2e', nickname: 'user-1', authority: 1, password_hash: '$ome_password', otp_secret: 'NFDCMADPEVFEMSIC', event_time: Date.now() + TIME_INCREMENT },
  { uid: '99720f31-d944-4e21-a402-b420ed413fed', nickname: 'user-2', authority: 2, password_hash: '$ome_password', otp_secret: 'L5IFQI2EHAYAODTF', event_time: Date.now() + (TIME_INCREMENT * 2) },
  { uid: 'e9a214bb-c4da-4af7-a514-d57bfd91e94e', nickname: 'user-3', authority: 3, password_hash: '$ome_password', otp_secret: 'DEVC63QFD4OS2UKY', event_time: Date.now() + (TIME_INCREMENT * 3) },
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
  });

  describe('sign & verify', () => {
    test('can sign and verify a JSON Web Token', async () => {
      for (const user of U) {
        await createUser(user);
        const refreshToken = await sign(user.uid, addDays(new Date(), 30), S);
        const decodedUID = await verify(refreshToken, S);
        expect(user.uid).toBe(decodedUID);
      }
    });
  });



  describe('saveRecord', () => {
    test('can generate a session for brand new users', async () => {
      for (const user of U) {
        await createUser(user);

        const refreshToken = await sign(user.uid, addDays(new Date(), 30), S);
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
});
