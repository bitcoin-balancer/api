/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import { describe, beforeAll, afterAll, beforeEach, afterEach, test, expect } from 'vitest';
import { IAPIError } from './types.js';
import { deleteAllRecords, getRecord, listRecords, saveRecord } from './model.js';
import { objectValid } from '../shared/validations/index.js';

/* ************************************************************************************************
 *                                            HELPERS                                             *
 ************************************************************************************************ */

// builds an error record from a partial object
const buildErr = (err: Partial<IAPIError> = {}): IAPIError => ({
  id: err.id ?? 0,
  origin: err.origin ?? 'AutomatedTest',
  error: err.error ?? 'Some Error!',
  event_time: err.event_time ?? Date.now(),
  uid: err.uid || null,
  ip: err.ip || null,
  args: err.args || null,
});

// saves a given list of errors in sequential order and returns the ids
const saveRecords = async (errors: IAPIError[]): Promise<number[]> => {
  const ids: number[] = [];
  for (const r of errors) {
    const id = await saveRecord(r.origin, r.error, r.uid!, r.ip!, r.args!);
    ids.push(id);
  }
  return ids;
};




/* ************************************************************************************************
 *                                           CONSTANTS                                            *
 ************************************************************************************************ */

// list of fake errors
const ERRORS: IAPIError[] = [
  buildErr(),
  buildErr({ uid: '2b7f67e2-d13d-49d9-b2bf-3275cbe454a2' }),
  buildErr({ uid: '2b7f67e2-d13d-49d9-b2bf-3275cbe454a2', ip: '172.17.0.1' }),
  buildErr({ uid: 'b49469f6-b372-4cbc-8d6c-46625071231f', ip: '193.36.224.129' }),
  buildErr({
    uid: 'b49469f6-b372-4cbc-8d6c-46625071231f',
    ip: '193.36.224.129',
    args: { foo: 'bar', bar: 123, zac: true, fake: [1, 2, 3], nesty: { hello: 'World' } },
  }),
];



/* ************************************************************************************************
 *                                             TESTS                                              *
 ************************************************************************************************ */
describe('APIError Model', () => {
  beforeAll(() => { });

  afterAll(() => { });

  beforeEach(() => { });

  afterEach(async () => {
    await deleteAllRecords();
  });

  describe('saveRecord', () => {
    test('can save a series of records, validate their integrity and delete them', async () => {
      // init the list of ids
      const ids: number[] = [];

      // save the records and validate their integrities
      for (const r of ERRORS) {
        const id = await saveRecord(r.origin, r.error, r.uid!, r.ip!, r.args!);
        expect(id).toBeTypeOf('number');
        expect(id).toBeGreaterThan(0);

        const savedRecord = <IAPIError> await getRecord(id);
        expect(objectValid(savedRecord)).toBe(true);
        expect(savedRecord).toStrictEqual({ ...r, id, event_time: savedRecord.event_time });

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
      const ids = await saveRecords(ERRORS);

      // records are retrieved in descending order - reverse the isd and the error records
      const reversedIDs = ids.slice();
      reversedIDs.reverse();
      const reversedErrors = ERRORS.slice();
      reversedErrors.reverse();

      // retrieve the records again an ensure they were properly inserted
      records = await listRecords(10);
      expect(records).toHaveLength(ERRORS.length);
      for (let i = 0; i < records.length; i += 1) {
        expect(records[i]).toStrictEqual({
          ...reversedErrors[i],
          id: reversedIDs[i],
          event_time: records[i].event_time,
        });
      }

      // delete the records and ensure they're gone
      await deleteAllRecords();
      records = await listRecords(10);
      expect(records).toHaveLength(0);
    });

    test('can list any number of records', async () => {
      // save the test records in order
      const ids = await saveRecords(ERRORS);

      // make sure only the last 2 records have been listed
      const records = await listRecords(2);
      expect(records).toHaveLength(2);
      expect(records).toStrictEqual([
        { ...ERRORS.at(-1), id: ids.at(-1), event_time: records[0].event_time },
        { ...ERRORS.at(-2), id: ids.at(-2), event_time: records[1].event_time },
      ]);
    });
  });



  describe('__listNextRecords', () => {
    test.todo('can paginate through the records', async () => {
      // save the test records in order
      const ids = await saveRecords(ERRORS);

      // list the first two records
      const records = await listRecords(2);
      expect(records).toHaveLength(2);
      expect(records).toStrictEqual([
        { ...ERRORS.at(-1), id: ids.at(-1), event_time: records[0].event_time },
        { ...ERRORS.at(-2), id: ids.at(-2), event_time: records[1].event_time },
      ]);

      // list the next record
      const nextRecord = await listRecords(1, records.at(-1)!.id);
      expect(nextRecord).toHaveLength(1);
      expect(nextRecord).toStrictEqual([
        { ...ERRORS.at(-3), id: ids.at(-3), event_time: nextRecord[0].event_time },
      ]);

      // list the next two records
      const nextRecords = await listRecords(2, nextRecord[0].id);
      expect(nextRecords).toHaveLength(2);
      expect(nextRecords).toStrictEqual([
        { ...ERRORS.at(-4), id: ids.at(-4), event_time: nextRecords[0].event_time },
        { ...ERRORS.at(-5), id: ids.at(-5), event_time: nextRecords[1].event_time },
      ]);
    });
  });
});
