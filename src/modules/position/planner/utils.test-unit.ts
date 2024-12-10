import { describe, test, expect } from 'vitest';
import { calculateMissingQuoteAmount } from './utils.js';
import { IBalances } from '../../shared/exchange/types.js';
import { ENVIRONMENT } from '../../shared/environment/index.js';

/* ************************************************************************************************
 *                                           CONSTANTS                                            *
 ************************************************************************************************ */

// the supported assets
const BASE_ASSET = ENVIRONMENT.EXCHANGE_CONFIGURATION.baseAsset;
const QUOTE_ASSET = ENVIRONMENT.EXCHANGE_CONFIGURATION.quoteAsset;





/* ************************************************************************************************
 *                                            HELPERS                                             *
 ************************************************************************************************ */

// builds the balances object from a partial
const b = (balances: Partial<IBalances>): IBalances => ({
  [BASE_ASSET]: 0,
  [QUOTE_ASSET]: 0,
  refetchTime: Date.now(),
  ...balances,
});





/* ************************************************************************************************
 *                                             TESTS                                              *
 ************************************************************************************************ */

describe('calculateMissingQuoteAmount', () => {
  test('can identify when there is enough balance', () => {
    expect(calculateMissingQuoteAmount(1000, b({ [QUOTE_ASSET]: 1500 }))).toBe(0);
  });
  test('can identify when there is a balance gap', () => {
    expect(calculateMissingQuoteAmount(2000, b({ [QUOTE_ASSET]: 1500 }))).toBe(500);
  });
});
