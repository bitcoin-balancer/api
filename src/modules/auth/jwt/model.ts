import { encodeError } from 'error-message-utils';
import { DatabaseService, IQueryResult } from '../../database/index.js';
import { IRefreshTokenRecord } from './types.js';

/* ************************************************************************************************
 *                                          RETRIEVERS                                            *
 ************************************************************************************************ */

/**
 * Retrieves the list of Refresh JWTs a user has in the database.
 * @param uid
 * @returns Promise<string[]>
 * @throws
 * - 4750: if the user doesn't have Refresh JWTs
 */
const getRefreshTokensByUID = async (uid: string): Promise<string[]> => {
  const { rows } = await DatabaseService.pool.query({
    text: `
      SELECT token
      FROM ${DatabaseService.tn.refresh_tokens}
      WHERE uid = $1;
    `,
    values: [uid],
  });
  if (!rows.length) {
    throw new Error(encodeError(`The uid '${uid}' has no registered Refresh JWTs in the database.`, 4750));
  }
  return rows.map((row) => row.token);
};

/**
 * Lists all the existing refresh token records for a uid. If a user has no records it means they
 * don't have an active session on any device.
 * @param uid
 * @returns Promise<IRefreshTokenRecord[]>
 */
const listRecordsByUID = async (uid: string): Promise<IRefreshTokenRecord[]> => {
  const { rows } = await DatabaseService.pool.query({
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
  DatabaseService.pool.query({
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
    ? DatabaseService.pool.query({
      text: `
        DELETE FROM ${DatabaseService.tn.refresh_tokens}
        WHERE uid = $1 AND token = $2;
      `,
      values: [uid, refreshJWT],
    })
    : DatabaseService.pool.query({
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
  DatabaseService.pool.query({
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
const deleteAllRecords = (): Promise<IQueryResult> => DatabaseService.pool.query({
  text: `DELETE FROM ${DatabaseService.tn.refresh_tokens};`,
  values: [],
});





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  // retrievers
  getRefreshTokensByUID,
  listRecordsByUID,

  // record management
  saveRecord,
  deleteUserRecords,
  deleteExpiredRecords,
  deleteAllRecords,
};
