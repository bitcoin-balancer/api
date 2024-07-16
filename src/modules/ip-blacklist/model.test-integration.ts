/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import { describe, afterEach, test, expect } from 'vitest';
import {
  getRecord,
  getRecordByIP,
  listIPs,
  listRecords,
  createRecord,
  updateRecord,
  deleteRecord,
  deleteAllRecords,
} from './model.js';

/* ************************************************************************************************
 *                                           CONSTANTS                                            *
 ************************************************************************************************ */

// list of mock ip addresses
const IPs: string[] = [
  '192.168.0.1', '192.168.0.12', '199.115.195.106', 'ffff:192.168.0.1', '172.16.20.65', '127.0.0.1',
];





/* ************************************************************************************************
 *                                            HELPERS                                             *
 ************************************************************************************************ */

// creates records for a given list of ips in sequential order
const createRecords = async (ips: string[]): Promise<number[]> => {
  const ids: number[] = [];
  for (const ip of ips) {
    ids.push(await createRecord(ip, undefined, Date.now()));
  }
  return ids;
};




/* ************************************************************************************************
 *                                             TESTS                                              *
 ************************************************************************************************ */
describe('IP Blacklist Model', () => {
  afterEach(async () => {
    await deleteAllRecords();
  });

  /* **********************************************************************************************
   *                                          RETRIEVERS                                          *
   ********************************************************************************************** */
  describe('listIPs', () => {
    test('can create several records and retrieve the list of IPs', async () => {
      await Promise.all(IPs.map((ip) => createRecord(ip, undefined, Date.now())));
      const ips = await listIPs();
      expect(ips).toHaveLength(IPs.length);
      ips.forEach((ip) => {
        expect(IPs).toContainEqual(ip);
      });
    });
  });





  describe('__listRecords', () => {
    test('can list the stored records in the correct order', async () => {
      let records = await listRecords(10);
      expect(records).toHaveLength(0);

      const ids = await createRecords(IPs);

      ids.reverse();
      const reversedIPs = IPs.slice();
      reversedIPs.reverse();

      records = await listRecords(10);
      records.forEach((record, i) => {
        expect(record).toStrictEqual({
          id: ids[i],
          ip: reversedIPs[i],
          notes: null,
          event_time: record.event_time,
        });
      });
    });

    test('can list any number of records', async () => {
      const ids = await createRecords(IPs);
      const records = await listRecords(2);
      expect(records).toHaveLength(2);
      expect(records).toStrictEqual([
        { id: ids.at(-1), ip: IPs.at(-1), notes: null, event_time: records[0].event_time },
        { id: ids.at(-2), ip: IPs.at(-2), notes: null, event_time: records[1].event_time },
      ]);
    });
  });

  describe('__listNextRecords', () => {
    test('can paginate through the records', async () => {
      const ids = await createRecords(IPs);

      // list the first two records
      const records = await listRecords(2);
      expect(records).toHaveLength(2);
      expect(records).toStrictEqual([
        { id: ids.at(-1), ip: IPs.at(-1), notes: null, event_time: records[0].event_time },
        { id: ids.at(-2), ip: IPs.at(-2), notes: null, event_time: records[1].event_time },
      ]);

      // list the next record
      const nextRecord = await listRecords(1, records.at(-1)!.id);
      expect(nextRecord).toHaveLength(1);
      expect(nextRecord).toStrictEqual([
        { id: ids.at(-3), ip: IPs.at(-3), notes: null, event_time: nextRecord[0].event_time },
      ]);

      // list the next two records
      const nextRecords = await listRecords(2, nextRecord[0].id);
      expect(nextRecords).toHaveLength(2);
      expect(nextRecords).toStrictEqual([
        { id: ids.at(-4), ip: IPs.at(-4), notes: null, event_time: nextRecords[0].event_time },
        { id: ids.at(-5), ip: IPs.at(-5), notes: null, event_time: nextRecords[1].event_time },
      ]);
    });
  });





  /* **********************************************************************************************
   *                                       RECORD MANAGEMENT                                      *
   ********************************************************************************************** */
  describe('createRecord', () => {
    test('can create a record and validate its integrity', async () => {
      let record = await getRecord(1);
      expect(record).toBeUndefined();

      record = await getRecordByIP(IPs[0]);
      expect(record).toBeUndefined();

      const id = await createRecord(IPs[0], 'Some cool notes!', Date.now());

      record = await getRecord(id);
      expect(record).toBeDefined();
      expect(record).toStrictEqual({
        id,
        ip: IPs[0],
        notes: 'Some cool notes!',
        event_time: record!.event_time,
      });

      record = await getRecordByIP(IPs[0]);
      expect(record).toBeDefined();
      expect(record).toStrictEqual({
        id,
        ip: IPs[0],
        notes: 'Some cool notes!',
        event_time: record!.event_time,
      });

      await deleteRecord(id);
      record = await getRecord(id);
      expect(record).toBeUndefined();
      record = await getRecordByIP(IPs[0]);
      expect(record).toBeUndefined();
    });

    test('can create a record without a note', async () => {
      const id = await createRecord(IPs[0], undefined, Date.now());

      let record = await getRecord(id);
      expect(record).toBeDefined();
      expect(record).toStrictEqual({
        id,
        ip: IPs[0],
        notes: null,
        event_time: record!.event_time,
      });

      record = await getRecordByIP(IPs[0]);
      expect(record).toBeDefined();
      expect(record).toStrictEqual({
        id,
        ip: IPs[0],
        notes: null,
        event_time: record!.event_time,
      });
    });
  });





  describe('updateRecord', () => {
    test('can create a record and update it', async () => {
      const id = await createRecord(IPs[0], 'Some Cool Note', Date.now());

      await updateRecord(id, IPs[1], undefined);
      let record = await getRecord(id);
      expect(record).toBeDefined();
      expect(record).toStrictEqual({
        id,
        ip: IPs[1],
        notes: null,
        event_time: record!.event_time,
      });

      await updateRecord(id, IPs[1], 'Re-add a note to see what happens :o');
      record = await getRecord(id);
      expect(record).toBeDefined();
      expect(record).toStrictEqual({
        id,
        ip: IPs[1],
        notes: 'Re-add a note to see what happens :o',
        event_time: record!.event_time,
      });
    });
  });

  test('can update a record that didn\'t have a note initially', async () => {
    const id = await createRecord(IPs[0], undefined, Date.now());
    await updateRecord(id, IPs[0], 'Add this sweet note');
    const record = await getRecord(id);
    expect(record).toBeDefined();
    expect(record).toStrictEqual({
      id,
      ip: IPs[0],
      notes: 'Add this sweet note',
      event_time: record!.event_time,
    });
  });
});
