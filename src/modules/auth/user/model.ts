import { encodeError } from 'error-message-utils';
import { DatabaseService, IQueryResult } from '../../database/index.js';
import {
  IAuthority,
  IUser,
  IMinifiedUser,
  IPasswordUpdate,
} from './types.js';

/* ************************************************************************************************
 *                                           RETRIEVERS                                           *
 ************************************************************************************************ */

/**
 * Retrieves all the user records ordered by authority descendingly.
 * @returns Promise<IUser[]>
 */
const listRecords = async (): Promise<IUser[]> => {
  const { rows } = await DatabaseService.pool.query({
    text: `
      SELECT uid, nickname, authority, event_time
      FROM ${DatabaseService.tn.users}
      ORDER BY authority DESC;
    `,
  });
  return rows;
};

/**
 * Retrieves all the user records ordered by authority descendingly.
 * @returns Promise<IUser[]>
 */
const listMinifiedRecords = async (): Promise<IMinifiedUser[]> => {
  const { rows } = await DatabaseService.pool.query({
    text: `
      SELECT uid, nickname, authority
      FROM ${DatabaseService.tn.users}
      ORDER BY authority DESC;
    `,
  });
  return rows;
};

/**
 * Retrieves a user by ID. Returns undefined if the user is not in the database.
 * @param uid
 * @returns Promise<IUser | undefined>
 */
const getUserRecord = async (uid: string): Promise<IUser | undefined> => {
  const { rows } = await DatabaseService.pool.query({
    text: `
      SELECT uid, nickname, authority, event_time
      FROM ${DatabaseService.tn.users}
      WHERE uid = $1;
    `,
    values: [uid],
  });
  return rows[0];
};

/**
 * Retrieves the Password Hash for a user based on its ID.
 * @param uid
 * @returns Promise<string>
 * @throws
 * - 3251: if the user record does not exist or the Password Hash is not valid
 */
const getUserPasswordHash = async (uid: string): Promise<string> => {
  const { rows } = await DatabaseService.pool.query({
    text: `
      SELECT password_hash
      FROM ${DatabaseService.tn.users}
      WHERE uid = $1;
    `,
    values: [uid],
  });
  if (!rows.length || typeof rows[0].password_hash !== 'string' || !rows[0].password_hash.length) {
    throw new Error(encodeError(`The password_hash retrieved for uid '${uid}' doesn't exist or is invalid. Please go through the "Update Password" process before trying sign in again.`, 3251));
  }
  return rows[0].password_hash;
};

/**
 * Retrieves the OTP Secret for a user based on its ID.
 * @param uid
 * @returns Promise<string>
 * @throws
 * - 3250: if the user record does not exist or the OTP Secret is not valid
 */
const getUserOTPSecret = async (uid: string): Promise<string> => {
  const { rows } = await DatabaseService.pool.query({
    text: `
      SELECT otp_secret
      FROM ${DatabaseService.tn.users}
      WHERE uid = $1;
    `,
    values: [uid],
  });
  if (!rows.length || typeof rows[0].otp_secret !== 'string' || !rows[0].otp_secret.length) {
    throw new Error(encodeError(`The otp_secret retrieved for uid '${uid}' doesn't exist or is invalid. Received: ${rows.length ? rows[0].otp_secret : 'undefined'}`, 3250));
  }
  return rows[0].otp_secret;
};





/* ************************************************************************************************
 *                               PASSWORD UPDATE RECORD RETRIEVERS                                *
 ************************************************************************************************ */

/**
 * Retrieves a list of existing password update records for a uid.
 * @param uid
 * @param limit
 * @returns Promise<IPasswordUpdate[]>
 */
const __listPasswordUpdateRecords = async (
  uid: string,
  limit: number,
): Promise<IPasswordUpdate[]> => {
  const { rows } = await DatabaseService.pool.query({
    text: `
      SELECT uid, event_time
      FROM ${DatabaseService.tn.password_updates}
      WHERE uid = $1
      ORDER BY event_time DESC
      LIMIT $2;
    `,
    values: [uid, limit],
  });
  return rows;
};

/**
 * Retrieves a list of password update records for a uid starting at a given point. Note: the
 * startAtEventTime record won't be included in the result.
 * @param uid
 * @param limit
 * @param startAtEventTime
 * @returns Promise<IPasswordUpdate[]>
 */
const __listNextPasswordUpdateRecords = async (
  uid: string,
  limit: number,
  startAtEventTime: number,
): Promise<IPasswordUpdate[]> => {
  const { rows } = await DatabaseService.pool.query({
    text: `
      SELECT uid, event_time
      FROM ${DatabaseService.tn.password_updates}
      WHERE uid = $1 AND event_time < $2
      ORDER BY event_time DESC
      LIMIT $3;
    `,
    values: [uid, startAtEventTime, limit],
  });
  return rows;
};

/**
 * Retrieves a list of password update records for a user. If the startAtEventTime is provided, it
 * will only retrieve records that are older than the passed timestamp (exclusive).
 * @param uid
 * @param limit
 * @param startAtEventTime?
 * @returns Promise<IPasswordUpdate[]>
 */
const listUserPasswordUpdateRecords = async (
  uid: string,
  limit: number,
  startAtEventTime?: number,
): Promise<IPasswordUpdate[]> => (
  typeof startAtEventTime === 'number'
    ? __listNextPasswordUpdateRecords(uid, limit, startAtEventTime)
    : __listPasswordUpdateRecords(uid, limit)
);





/* ************************************************************************************************
 *                                     USER RECORD MANAGEMENT                                     *
 ************************************************************************************************ */

/**
 * Stores a user record in the Database.
 * @param uid
 * @param nickname
 * @param authority
 * @param otpSecret
 * @param passwordHash?
 * @returns Promise<IQueryResult>
 */
const createUserRecord = (
  uid: string,
  nickname: string,
  authority: IAuthority,
  otpSecret: string,
  passwordHash?: string,
): Promise<IQueryResult> => DatabaseService.pool.query({
  text: `
    INSERT INTO ${DatabaseService.tn.users} (uid, nickname, authority, password_hash, otp_secret, event_time)
    VALUES ($1, $2, $3, $4, $5, $6);
  `,
  values: [uid, nickname, authority, passwordHash, otpSecret, Date.now()],
});

/**
 * Updates the user's nickname.
 * @param uid
 * @param newNickname
 * @returns Promise<IQueryResult>
 */
const updateUserNickname = (uid: string, newNickname: string): Promise<IQueryResult> => (
  DatabaseService.pool.query({
    text: `UPDATE ${DatabaseService.tn.users} SET nickname = $1 WHERE uid = $2;`,
    values: [newNickname, uid],
  })
);

/**
 * Updates the user's authority.
 * @param uid
 * @param newAuthority
 * @returns Promise<IQueryResult>
 */
const updateUserAuthority = (uid: string, newAuthority: IAuthority): Promise<IQueryResult> => (
  DatabaseService.pool.query({
    text: `UPDATE ${DatabaseService.tn.users} SET authority = $1 WHERE uid = $2;`,
    values: [newAuthority, uid],
  })
);

/**
 * Updates the user's password hash and logs the update it in a transaction.
 * @param uid
 * @param newPasswordHash
 * @returns Promise<void>
 */
const updateUserPasswordHash = async (uid: string, newPasswordHash: string): Promise<void> => {
  const client = await DatabaseService.pool.connect();
  try {
    await client.query('BEGIN');
    await client.query({
      text: `UPDATE ${DatabaseService.tn.users} SET password_hash = $1 WHERE uid = $2;`,
      values: [newPasswordHash, uid],
    });
    await client.query({
      text: `INSERT INTO ${DatabaseService.tn.password_updates} (uid, event_time) VALUES ($1, $2)`,
      values: [uid, Date.now()],
    });
    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
};

/**
 * Updates the user's OTP Secret.
 * @param uid
 * @param newSecret
 * @returns Promise<IQueryResult>
 */
const updateUserOTPSecret = (uid: string, newSecret: string): Promise<IQueryResult> => (
  DatabaseService.pool.query({
    text: `UPDATE ${DatabaseService.tn.users} SET otp_secret = $1 WHERE uid = $2;`,
    values: [newSecret, uid],
  })
);

/**
 * Deletes a user's record from the database.
 * @param uid
 * @returns Promise<IQueryResult>
 */
const deleteUserRecord = (uid: string): Promise<IQueryResult> => (
  DatabaseService.pool.query({
    text: `DELETE FROM ${DatabaseService.tn.users} WHERE uid = $1;`,
    values: [uid],
  })
);

/**
 * Deletes all the user records from the database. This function is only to be invoked from the
 * integration tests.
 * @returns Promise<IQueryResult>
 */
const deleteAllUserRecords = (): Promise<IQueryResult> => (
  DatabaseService.pool.query({
    text: `DELETE FROM ${DatabaseService.tn.users};`,
  })
);





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  // retrievers
  listRecords,
  listMinifiedRecords,
  getUserRecord,
  getUserPasswordHash,
  getUserOTPSecret,
  listUserPasswordUpdateRecords,

  // user record management
  createUserRecord,
  updateUserNickname,
  updateUserAuthority,
  updateUserPasswordHash,
  updateUserOTPSecret,
  deleteUserRecord,
  deleteAllUserRecords,
};
