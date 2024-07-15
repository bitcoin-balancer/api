import { DatabaseService, IQueryResult } from '../../database/index.js';
import { IRefreshTokenRecord } from './types.js';

/* ************************************************************************************************
 *                                          RETRIEVERS                                            *
 ************************************************************************************************ */

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
  listRecordsByUID,

  // record management
  saveRecord,
  deleteAllRecords,
};
