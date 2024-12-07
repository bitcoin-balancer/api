/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import { describe, afterEach, test, expect } from 'vitest';
import { isObjectValid } from 'web-utils-kit';
import { INotification } from './types.js';
import { deleteAllRecords, getRecord, listRecords, saveRecord } from './model.js';

/* ************************************************************************************************
 *                                            HELPERS                                             *
 ************************************************************************************************ */

// builds a record from a partial object
const buildRecord = (err: Partial<INotification> = {}): INotification => ({
  id: err.id ?? 0,
  sender: err.sender ?? 'AUTOMATED_TEST',
  title: err.title ?? 'Some Title!',
  description: err.description ?? 'Some very cool Description!',
  event_time: err.event_time ?? Date.now(),
});

// saves a given list of records in sequential order and returns the ids
const saveRecords = async (records: INotification[]): Promise<number[]> => {
  const ids: number[] = [];
  for (const r of records) {
    const id = await saveRecord(r.sender, r.title, r.description, r.event_time);
    ids.push(id);
  }
  return ids;
};





/* ************************************************************************************************
 *                                           CONSTANTS                                            *
 ************************************************************************************************ */

// list of fake records
const RECORDS: INotification[] = [
  buildRecord(),
  buildRecord({ sender: 'AUTOMATED_TEST', title: 'Title 1', description: 'Description 1' }),
  buildRecord({ sender: 'AUTOMATED_TEST', title: 'Title 2', description: 'Description 2' }),
  buildRecord({ sender: 'AUTOMATED_TEST', title: 'Title 3', description: 'Description 3' }),
  buildRecord({ sender: 'AUTOMATED_TEST', title: 'Title 4', description: 'Description 4' }),
  buildRecord({ sender: 'AUTOMATED_TEST', title: 'Title 5', description: 'Description 5' }),
  buildRecord({ sender: 'AUTOMATED_TEST', title: 'Title 6', description: 'Description 6' }),
  buildRecord({ sender: 'AUTOMATED_TEST', title: 'Title 7', description: 'Description 7' }),
];





/* ************************************************************************************************
 *                                             TESTS                                              *
 ************************************************************************************************ */
describe('Notification Model', () => {
  afterEach(async () => {
    await deleteAllRecords();
  });

  describe('saveRecord', () => {
    test('can save a series of records, validate their integrity and delete them', async () => {
      // init the list of ids
      const ids: number[] = [];

      // save the records and validate their integrities
      for (const r of RECORDS) {
        const id = await saveRecord(r.sender, r.title, r.description, r.event_time);
        expect(id).toBeTypeOf('number');
        expect(id).toBeGreaterThan(0);

        const savedRecord = <INotification> await getRecord(id);
        expect(isObjectValid(savedRecord)).toBe(true);
        expect(savedRecord).toStrictEqual({ ...r, id });

        // store the id for later
        ids.push(id);
      }

      // delete all the records and ensure they are gone
      await deleteAllRecords();
      const deletedRecords = await Promise.all(ids.map(getRecord));
      expect(deletedRecords.every((rec) => rec === null)).toBe(true);
    });
  });



  describe('__listRecords', () => {
    test('can list stored records', async () => {
      // in the beginning there was nothing
      let records = await listRecords(10);
      expect(records).toHaveLength(0);

      // save the test records in order
      const ids = await saveRecords(RECORDS);

      // records are retrieved in descending order - reverse the isd and the error records
      const reversedIDs = ids.slice();
      reversedIDs.reverse();
      const reversedRECORDS = RECORDS.slice();
      reversedRECORDS.reverse();

      // retrieve the records again an ensure they were properly inserted
      records = await listRecords(10);
      expect(records).toHaveLength(RECORDS.length);
      for (let i = 0; i < records.length; i += 1) {
        expect(records[i]).toStrictEqual({
          ...reversedRECORDS[i],
          id: reversedIDs[i],
        });
      }

      // delete the records and ensure they're gone
      await deleteAllRecords();
      records = await listRecords(10);
      expect(records).toHaveLength(0);
    });

    test('can list any number of records', async () => {
      // save the test records in order
      const ids = await saveRecords(RECORDS);

      // make sure only the last 2 records have been listed
      const records = await listRecords(2);
      expect(records).toHaveLength(2);
      expect(records).toStrictEqual([
        { ...RECORDS.at(-1), id: ids.at(-1) },
        { ...RECORDS.at(-2), id: ids.at(-2) },
      ]);
    });
  });



  describe('__listNextRecords', () => {
    test('can paginate through the records', async () => {
      // save the test records in order
      const ids = await saveRecords(RECORDS);

      // list the first two records
      const records = await listRecords(2);
      expect(records).toHaveLength(2);
      expect(records).toStrictEqual([
        { ...RECORDS.at(-1), id: ids.at(-1) },
        { ...RECORDS.at(-2), id: ids.at(-2) },
      ]);

      // list the next record
      const nextRecord = await listRecords(1, records.at(-1)!.id);
      expect(nextRecord).toHaveLength(1);
      expect(nextRecord).toStrictEqual([
        { ...RECORDS.at(-3), id: ids.at(-3) },
      ]);

      // list the next two records
      const nextRecords = await listRecords(2, nextRecord[0].id);
      expect(nextRecords).toHaveLength(2);
      expect(nextRecords).toStrictEqual([
        { ...RECORDS.at(-4), id: ids.at(-4) },
        { ...RECORDS.at(-5), id: ids.at(-5) },
      ]);
    });
  });
});
