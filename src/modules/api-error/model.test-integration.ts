import { describe, beforeAll, afterAll, beforeEach, afterEach, test, expect } from 'vitest';
import { IAPIError } from './types.js';
import { deleteAllRecords, getRecord, saveRecord } from './model.js';
import { NonEmptyArray } from '../shared/types.js';
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





/* ************************************************************************************************
 *                                           CONSTANTS                                            *
 ************************************************************************************************ */

// list of fake errors
const errs: NonEmptyArray<IAPIError> = [
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
describe('saveRecord', () => {
  beforeAll(() => { });

  afterAll(() => { });

  beforeEach(() => { });

  afterEach(async () => {
    await deleteAllRecords();
  });

  test('can save a series of records, validate their integrity and delete them', async () => {
    // init the list of ids
    const ids: number[] = [];

    // save the records and validate their integrities
    // eslint-disable-next-line no-restricted-syntax
    for (const r of errs) {
      // eslint-disable-next-line no-await-in-loop
      const id = await saveRecord(r.origin, r.error, r.uid!, r.ip!, r.args!);
      expect(id).toBeTypeOf('number');
      expect(id).toBeGreaterThan(0);

      // eslint-disable-next-line no-await-in-loop
      const savedRecord = await getRecord(id);
      expect(objectValid(savedRecord)).toBe(true);
      expect(savedRecord).toStrictEqual({ ...r, id, event_time: savedRecord?.event_time });

      // store the id for later
      ids.push(id);
    }

    // delete all the records and ensure they are gone
    await deleteAllRecords();
    const deletedRecords = await Promise.all(ids.map(getRecord));
    expect(deletedRecords.every((rec) => rec === null)).toBe(true);
  });
});
