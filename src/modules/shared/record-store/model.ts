import { DatabaseService, IQueryResult } from '../../database/index.js';
import { IStoreID } from './types.js';

/* ************************************************************************************************
 *                                         IMPLEMENTATION                                         *
 ************************************************************************************************ */

/**
 * Retrieves a record by ID. If the record is not found it returns null.
 * @param id
 * @returns Promise<T | null>
 */
const readRecord = async <T>(id: IStoreID): Promise<T | null> => {
  const { rows } = await DatabaseService.query({
    text: `
      SELECT value
      FROM ${DatabaseService.tn.record_stores}
      WHERE id = $1;
    `,
    values: [id],
  });
  return rows.length > 0 ? rows[0].value : null;
};

/**
 * Creates or updates a record.
 * @param id
 * @param value
 * @param initializing?
 * @returns Promise<IQueryResult>
 */
const writeRecord = async <T>(
  id: IStoreID,
  value: T,
  initializing?: boolean,
): Promise<IQueryResult> => {
  if (initializing) {
    return DatabaseService.query({
      text: `
        INSERT INTO ${DatabaseService.tn.record_stores} (id, value)
        VALUES ($1, $2);
      `,
      values: [id, value],
    });
  }
  return DatabaseService.query({
    text: `
      UPDATE ${DatabaseService.tn.record_stores}
      SET value = $1
      WHERE id = $2;
    `,
    values: [value, id],
  });
};

/**
 * Deletes a record by Store ID.
 * @param id
 * @returns Promise<IQueryResult>
 */
const deleteRecord = async (id: IStoreID): Promise<IQueryResult> => DatabaseService.query({
  text: `
    DELETE FROM ${DatabaseService.tn.record_stores}
    WHERE id = $1;
  `,
  values: [id],
});





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  readRecord,
  writeRecord,
  deleteRecord,
};
