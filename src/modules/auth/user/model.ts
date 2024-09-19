import { encodeError } from 'error-message-utils';
import { DatabaseService, IQueryResult } from '../../database/index.js';
import {
  IAuthority,
  IUser,
  IPasswordUpdate,
} from './types.js';

/* ************************************************************************************************
 *                                           RETRIEVERS                                           *
 ************************************************************************************************ */

/**
 * Retrieves all the user records ordered by authority descendingly.
 * @returns Promise<IUser[]>
 */
const listUserRecords = async (): Promise<IUser[]> => {
  const { rows } = await DatabaseService.query({
    text: `
      SELECT uid, nickname, authority, event_time
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
  const { rows } = await DatabaseService.query({
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
 * Retrieves a user by Nickname.
 * @param nickname
 * @returns Promise<IUser>
 * @throws
 * - 3252: if no record is found for the nickname
 */
const getUserRecordByNickname = async (nickname: string): Promise<IUser> => {
  const { rows } = await DatabaseService.query({
    text: `
      SELECT uid, nickname, authority, event_time
      FROM ${DatabaseService.tn.users}
      WHERE LOWER(nickname) = $1;
    `,
    values: [nickname.toLowerCase()],
  });
  if (!rows.length) {
    throw new Error(encodeError(`The user record retrieved for nickname '${nickname}' doesn't exist.`, 3252));
  }
  return rows[0];
};

/**
 * Verifies if a nickname is already being used by another user.
 * @param nickname
 * @returns Promise<boolean>
 */
const nicknameExists = async (nickname: string): Promise<boolean> => {
  const { rows } = await DatabaseService.query({
    text: `
      SELECT 1
      FROM ${DatabaseService.tn.users}
      WHERE LOWER(nickname) = $1;
    `,
    values: [nickname.toLowerCase()],
  });
  return rows.length > 0;
};

/**
 * Retrieves the OTP Secret for a user based on its ID.
 * @param uid
 * @returns Promise<string>
 * @throws
 * - 3250: if the user record does not exist or the OTP Secret is not valid
 */
const getUserOTPSecret = async (uid: string): Promise<string> => {
  const { rows } = await DatabaseService.query({
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

/**
 * Retrieves the Password Hash for a user based on its nickname.
 * @param nickname
 * @returns Promise<string>
 * @throws
 * - 3250: if the user's OTP Secret is invalid
 * - 3251: if the password hash is invalid
 * - 3253: if the user's record does not exist
 */
const getUserSignInDataByNickname = async (
  nickname: string,
): Promise<{ uid: string, password_hash: string, otp_secret: string }> => {
  const { rows } = await DatabaseService.query({
    text: `
      SELECT uid, password_hash, otp_secret
      FROM ${DatabaseService.tn.users}
      WHERE LOWER(nickname) = $1;
    `,
    values: [nickname.toLowerCase()],
  });
  if (!rows.length) {
    throw new Error(encodeError(`The sign in data could not be retrieved for '${nickname}' because it doesn't exist.`, 3253));
  }
  if (typeof rows[0].password_hash !== 'string' || !rows[0].password_hash.length) {
    throw new Error(encodeError(`The password_hash retrieved for user '${nickname}' is invalid. Please go through the "Update Password" process before trying sign in again.`, 3251));
  }
  if (typeof rows[0].otp_secret !== 'string' || !rows[0].otp_secret.length) {
    throw new Error(encodeError(`The otp_secret retrieved for user '${nickname}' is invalid. Received: ${rows.length ? rows[0].otp_secret : 'undefined'}`, 3250));
  }
  return { uid: rows[0].uid, password_hash: rows[0].password_hash, otp_secret: rows[0].otp_secret };
};





/* ************************************************************************************************
 *                                   PASSWORD UPDATE RETRIEVERS                                   *
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
  const { rows } = await DatabaseService.query({
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
  const { rows } = await DatabaseService.query({
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
 * @param passwordHash
 * @param otpSecret
 * @param eventTime
 * @returns Promise<IQueryResult>
 */
const createUserRecord = (
  uid: string,
  nickname: string,
  authority: IAuthority,
  passwordHash: string | undefined,
  otpSecret: string,
  eventTime: number,
): Promise<IQueryResult> => DatabaseService.query({
  text: `
    INSERT INTO ${DatabaseService.tn.users} (uid, nickname, authority, password_hash, otp_secret, event_time)
    VALUES ($1, $2, $3, $4, $5, $6);
  `,
  values: [uid, nickname, authority, passwordHash, otpSecret, eventTime],
});

/**
 * Updates the user's nickname.
 * @param uid
 * @param newNickname
 * @returns Promise<IQueryResult>
 */
const updateUserNickname = (uid: string, newNickname: string): Promise<IQueryResult> => (
  DatabaseService.query({
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
  DatabaseService.query({
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
  DatabaseService.query({
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
  DatabaseService.query({
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
  DatabaseService.query({
    text: `DELETE FROM ${DatabaseService.tn.users};`,
  })
);





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  // retrievers
  listUserRecords,
  getUserRecord,
  getUserRecordByNickname,
  nicknameExists,
  getUserOTPSecret,
  getUserSignInDataByNickname,

  // password update retrievers
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
