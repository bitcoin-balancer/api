import { describe, test, expect } from 'vitest';
import { uuidValid } from '../validations/index.js';
import { generateUUID } from './index.js';

describe('generateUUID', () => {
  test('can generate a valid uuid v4', () => {
    [
      generateUUID(), generateUUID(), generateUUID(), generateUUID(), generateUUID(),
      generateUUID(), generateUUID(), generateUUID(), generateUUID(), generateUUID(),
      generateUUID(), generateUUID(), generateUUID(), generateUUID(), generateUUID(),
    ].forEach((uuid) => {
      expect(typeof uuid).toBe('string');
      expect(uuid.length).toBe(36);
      expect(uuidValid(uuid)).toBe(true);
      expect(
        /^[a-zA-Z0-9]{8}-[a-zA-Z0-9]{4}-[a-zA-Z0-9]{4}-[a-zA-Z0-9]{4}-[a-zA-Z0-9]{12}$/.test(uuid),
      ).toBe(true);
    });
  });
});
