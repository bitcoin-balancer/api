import { describe, test, expect } from 'vitest';
import { toSeconds, fromHoursToMinutes } from './index.js';

/* ************************************************************************************************
 *                                             TESTS                                              *
 ************************************************************************************************ */

describe('Time Converters', () => {
  describe('toSeconds', () => {
    test('can convert any number of milliseconds into seconds', () => {
      expect(toSeconds(1000)).toBe(1);
      expect(toSeconds(15123135451)).toBe(15123135);
      expect(toSeconds(65421484579)).toBe(65421485);
    });
  });


  describe('fromHoursToMinutes', () => {
    test('can convert any number of hours into minutes', () => {
      expect(fromHoursToMinutes(1)).toBe(60);
      expect(fromHoursToMinutes(24)).toBe(1440);
      expect(fromHoursToMinutes(66)).toBe(3960);
      expect(fromHoursToMinutes(72)).toBe(4320);
      expect(fromHoursToMinutes(8554)).toBe(513240);
    });
  });
});
