import { DatabaseService } from '../database/index.js';
import { INotification, INotificationSender } from './types.js';

/* ************************************************************************************************
 *                                         IMPLEMENTATION                                         *
 ************************************************************************************************ */

/**
 * Retrieves a record by ID. If the record is not found it returns null.
 * @param id
 * @returns Promise<INotification | null>
 */
const getRecord = async (id: number): Promise<INotification | null> => {
  const { rows } = await DatabaseService.pool.query({
    text: `
      SELECT id, sender, title, description, event_time
      FROM ${DatabaseService.tn.notifications} 
      WHERE id = $1;
    `,
    values: [id],
  });
  return rows.length > 0 ? rows[0] : null;
};

/**
 * Retrieves a list of existing records constrained by a limit.
 * @param limit
 * @returns Promise<INotification[]>
 */
const __listRecords = async (limit: number): Promise<INotification[]> => {
  const { rows } = await DatabaseService.pool.query({
    text: `
      SELECT id, sender, title, description, event_time
      FROM ${DatabaseService.tn.notifications} 
      ORDER BY id DESC
      LIMIT $1;
    `,
    values: [limit],
  });
  return rows;
};

/**
 * Retrieves the list of records starting at the given point. Note: the startAtID record will not
 * be included in the result.
 * @param limit
 * @param startAtID
 * @returns Promise<INotification[]>
 */
const __listNextRecords = async (limit: number, startAtID: number): Promise<INotification[]> => {
  const { rows } = await DatabaseService.pool.query({
    text: `
      SELECT id, sender, title, description, event_time
      FROM ${DatabaseService.tn.notifications} 
      WHERE id < $1
      ORDER BY id DESC
      LIMIT $2;
    `,
    values: [startAtID, limit],
  });
  return rows;
};

/**
 * Retrieves a list of records from the database. If a startAtID is provided, it will only
 * retrieve records that are older than the passed ID (exclusive).
 * @param limit
 * @param startAtID?
 * @returns Promise<INotification[]>
 */
const listRecords = (limit: number, startAtID?: number): Promise<INotification[]> => (
  typeof startAtID === 'number' ? __listNextRecords(limit, startAtID) : __listRecords(limit)
);

/**
 * Saves a record and returns its identifier.
 * @param sender
 * @param title
 * @param description
 * @param eventTime
 * @returns Promise<number>
 */
const saveRecord = async (
  sender: INotificationSender,
  title: string,
  description: string,
  eventTime: number,
): Promise<number> => {
  const { rows } = await DatabaseService.pool.query({
    text: `
      INSERT INTO ${DatabaseService.tn.notifications} (sender, title, description, event_time) 
      VALUES ($1, $2, $3, $4) 
      RETURNING id;
    `,
    values: [sender, title, description, eventTime],
  });
  return rows[0].id;
};

/**
 * Deletes all the existing records from the database.
 * @returns Promise<void>
 */
const deleteAllRecords = async (): Promise<void> => {
  await DatabaseService.pool.query({
    text: `DELETE FROM ${DatabaseService.tn.notifications};`,
  });
};





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  getRecord,
  listRecords,
  saveRecord,
  deleteAllRecords,
};
