/* eslint-disable @typescript-eslint/no-unused-vars */
import { describe, bench } from 'vitest';
import { addMinutes, addHours, addDays } from 'date-fns';

describe('date-fns', () => {
  bench('using new Date()', () => {
    const _ = addMinutes(new Date(), 60);
    const __ = addHours(new Date(), 24);
    const ___ = addDays(new Date(), 365);
  });

  bench('using Date.now()', () => {
    const _ = addMinutes(Date.now(), 60);
    const __ = addHours(Date.now(), 24);
    const ___ = addDays(Date.now(), 365);
  });
});
