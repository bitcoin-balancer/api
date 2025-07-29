import { describe, test, expect } from 'vitest';
import { IPBlacklistService } from './index.js';

/* ************************************************************************************************
 *                                           CONSTANTS                                            *
 ************************************************************************************************ */

// list of mock ip addresses
const IPs: string[] = [
  '192.168.0.1',
  '192.168.0.12',
  '199.115.195.106',
  'ffff:192.168.0.1',
  '172.16.20.65',
  '127.0.0.1',
];

/* ************************************************************************************************
 *                                             TESTS                                              *
 ************************************************************************************************ */
describe('isBlacklisted', () => {
  test('can check if an IP is blacklisted', () => {
    expect(IPBlacklistService.isBlacklisted(IPs[0])).toBeUndefined();
  });

  test('throws if a blacklisted IP is checked', async () => {
    await IPBlacklistService.registerIP(IPs[0], undefined);
    expect(() => IPBlacklistService.isBlacklisted(IPs[0])).toThrowError('5000');

    expect(IPBlacklistService.isBlacklisted(IPs[1])).toBeUndefined();
  });
});
