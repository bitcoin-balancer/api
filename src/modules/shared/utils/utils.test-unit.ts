import { describe, test, expect } from 'vitest';
import { fromMillisecondstoSeconds, fromHoursToMinutes } from './index.js';

/* ************************************************************************************************
 *                                             TESTS                                              *
 ************************************************************************************************ */

describe('Time Converters', () => {
  describe('fromMillisecondstoSeconds', () => {
    test('can convert any number of milliseconds into seconds', () => {
      expect(fromMillisecondstoSeconds(1000)).toBe(1);
      expect(fromMillisecondstoSeconds(15123135451)).toBe(15123135);
      expect(fromMillisecondstoSeconds(65421484579)).toBe(65421485);
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
