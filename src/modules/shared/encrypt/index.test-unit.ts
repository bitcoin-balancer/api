import { describe, test, expect, vi, afterEach } from 'vitest';
import { LONG_MESSAGE } from './test-data.js';
import { decryptData, encryptData } from './index.js';
import * as ENVIRONMENT from '../environment/index.js';

/* ************************************************************************************************
 *                                             MOCKS                                              *
 ************************************************************************************************ */

// alters the global ENVIRONMENT object
const mockEnvironment = (value: Partial<ENVIRONMENT.IEnvironment>) => vi.spyOn(
  ENVIRONMENT,
  'ENVIRONMENT',
  'get',
).mockReturnValue(value as ENVIRONMENT.IEnvironment);





/* ************************************************************************************************
 *                                         IMPLEMENTATION                                         *
 ************************************************************************************************ */

describe('Data Encrypting', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test.each([
    ['This is the message that will be encrypted.'],
    ['Lorem ipsum dolor sit amet consectetur adipisicing elit. Magnam nemo, quae atque laboriosam odit tempora praesentium quia voluptas similique excepturi recusandae cupiditate repellendus quas! Repellat officiis dignissimos nobis officia quae.'],
    ['HFLR63CLOQQC2RYA'],
    ['GAFSO3AAFICU6XB4FUXA2BIUE5XWI3BGDQGWUCQ3FB7TULKV'],
    ['81fa13b8-a769-491d-8050-714b36912b89'],
    ['k.EGYjMq4Edf/Q5C*ksMdX2/s/gNa%me%@*X_Vg(~CYP|x1Wjtd:T/C0dn3[JV.;pM:p$og[|N:oyAqjSXJyh;lNCe<A~7($XPMJXMc,f13ix1hzpim_)Rv$VB9e4(x1X!NN@Un-P^(WOd>?s!->x%f)TMdPvgwR-Yr<i9[7>i2UGJJ.BxMNO^w@aUtrlJf;JF~xY[4?'],
    [LONG_MESSAGE],
  ])('can encrypt and decrypt a string of any length', (a) => {
    const encryptedData = encryptData(a);
    expect(encryptedData).toBeTypeOf('string');
    expect(encryptedData.length).toBeGreaterThan(0);
    expect(a).toBe(decryptData(encryptedData));
  });

  test('decrypting with an invalid secret yields an invalid result', () => {
    const data = 'This is the message that will be encrypted.';
    const encryptedData = encryptData(data);
    mockEnvironment({ ENCRYPTING_SECRET: 'abc123456' });
    expect(data).not.toBe(decryptData(encryptedData));
  });
});
