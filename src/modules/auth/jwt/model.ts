import { encodeError } from 'error-message-utils';
import { DatabaseService, IQueryResult } from '../../database/index.js';
import { IRefreshTokenRecord } from './types.js';

/* ************************************************************************************************
 *                                          RETRIEVERS                                            *
 ************************************************************************************************ */

/**
 * Retrieves an uid based on a Refresh JWT.
 * @param refreshToken
 * @returns Promise<string>
 * @throws
 * - 4750: if there isn't a record that matches the refreshToken
 */
const getUidByRefreshToken = async (refreshToken: string): Promise<string> => {
  const { rows } = await DatabaseService.query({
    text: `
      SELECT uid
      FROM ${DatabaseService.tn.refresh_tokens}
      WHERE token = $1;
    `,
    values: [refreshToken],
  });
  if (!rows.length) {
    throw new Error(encodeError('The provided Refresh JWT did not match any uids stored in the database.', 4750));
  }
  return rows[0].uid;
};

/**
 * Lists all the existing refresh token records for a uid. If a user has no records it means they
 * don't have an active session on any device.
 * @param uid
 * @returns Promise<IRefreshTokenRecord[]>
 */
const listRecordsByUID = async (uid: string): Promise<IRefreshTokenRecord[]> => {
  const { rows } = await DatabaseService.query({
    text: `
      SELECT uid, token, event_time
      FROM ${DatabaseService.tn.refresh_tokens}
      WHERE uid = $1
      ORDER BY event_time DESC;
    `,
    values: [uid],
  });
  return rows;
};





/* ************************************************************************************************
 *                                       RECORD MANAGEMENT                                        *
 ************************************************************************************************ */

/**
 * Saves a record for a user who just signed in.
 * @param uid
 * @param refreshJWT
 * @returns Promise<IQueryResult>
 */
const saveRecord = (uid: string, refreshJWT: string): Promise<IQueryResult> => (
  DatabaseService.query({
    text: `
      INSERT INTO ${DatabaseService.tn.refresh_tokens} (uid, token, event_time)
      VALUES ($1, $2, $3);
    `,
    values: [uid, refreshJWT, Date.now()],
  })
);

/**
 * Deletes the refresh token records for a user. If the refreshJWT is provided, it will delete that
 * individual record. Otherwise, it deletes all the existing records for the user (sign out from
 * all devices).
 * @param uid
 * @param refreshJWT
 * @returns Promise<IQueryResult>
 */
const deleteUserRecords = (uid: string, refreshJWT?: string) => (
  typeof refreshJWT === 'string'
    ? DatabaseService.query({
      text: `
        DELETE FROM ${DatabaseService.tn.refresh_tokens}
        WHERE uid = $1 AND token = $2;
      `,
      values: [uid, refreshJWT],
    })
    : DatabaseService.query({
      text: `
        DELETE FROM ${DatabaseService.tn.refresh_tokens}
        WHERE uid = $1;
      `,
      values: [uid],
    })
);

/**
 * Deletes all the records containing Refresh JWTs that have expired.
 * @param startAtTimestamp
 * @returns Promise<IQueryResult>
 */
const deleteExpiredRecords = (startAtTimestamp: number): Promise<IQueryResult> => (
  DatabaseService.query({
    text: `
      DELETE FROM ${DatabaseService.tn.refresh_tokens}
      WHERE event_time <= $1;
    `,
    values: [startAtTimestamp],
  })
);

/**
 * Deletes all of the Refresh Token Records from the database. In other words, it signs out all of
 * the users.
 * @returns Promise<IQueryResult>
 */
const deleteAllRecords = (): Promise<IQueryResult> => DatabaseService.query({
  text: `DELETE FROM ${DatabaseService.tn.refresh_tokens};`,
  values: [],
});





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  // retrievers
  getUidByRefreshToken,
  listRecordsByUID,

  // record management
  saveRecord,
  deleteUserRecords,
  deleteExpiredRecords,
  deleteAllRecords,
};
