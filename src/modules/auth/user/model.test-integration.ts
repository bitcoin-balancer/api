import { describe, beforeAll, afterAll, beforeEach, afterEach, test, expect, vi } from 'vitest';
import { IUser } from './types.js';
import { deleteAllUserRecords } from './model.js';

/* ************************************************************************************************
 *                                           CONSTANTS                                            *
 ************************************************************************************************ */

const USERS: IUser[] = [
  { uid: '', nickname: 'user-1', authority: 1, password_hash: '$ome_password', otp_secret: '', event_time: 0 },
];



/* ************************************************************************************************
 *                                             TESTS                                              *
 ************************************************************************************************ */

describe('Test suite template', () => {
  beforeAll(() => { });

  afterAll(() => { });

  beforeEach(() => { });

  afterEach(async () => {
    await deleteAllUserRecords();
  });

  test.skip('can calculate 2 plus 2', () => {
    expect(2 + 2).toBe(4);
  });
});
