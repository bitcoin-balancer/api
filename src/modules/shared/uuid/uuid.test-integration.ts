import { describe, test, expect } from 'vitest';
import { generateUUID, validateUUID } from './uuid.js';

describe('generateUUID', () => {
  test('can generate a valid uuid v4', () => {
    [
      generateUUID(), generateUUID(), generateUUID(), generateUUID(), generateUUID(),
      generateUUID(), generateUUID(), generateUUID(), generateUUID(), generateUUID(),
      generateUUID(), generateUUID(), generateUUID(), generateUUID(), generateUUID(),
    ].forEach((uuid) => {
      expect(typeof uuid).toBe('string');
      expect(uuid.length).toBe(36);
      expect(validateUUID(uuid)).toBe(true);
      expect(
        /^[a-zA-Z0-9]{8}-[a-zA-Z0-9]{4}-[a-zA-Z0-9]{4}-[a-zA-Z0-9]{4}-[a-zA-Z0-9]{12}$/.test(uuid),
      ).toBe(true);
    });
  });
});



describe('validateUUID', () => {
  test('can identify invalid uuids', () => {
    // @ts-ignore
    expect(validateUUID()).toBe(false);
    // @ts-ignore
    expect(validateUUID(123)).toBe(false);
    // @ts-ignore
    expect(validateUUID(undefined)).toBe(false);
    // @ts-ignore
    expect(validateUUID(null)).toBe(false);
    expect(validateUUID('')).toBe(false);
    // @ts-ignore
    expect(validateUUID({})).toBe(false);
    expect(validateUUID('9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d')).toBe(true);
    expect(validateUUID('9b1deb4d-3b7d4bad-9bdd-2b0d7b3dcb6d')).toBe(false);
    expect(validateUUID('somethingelse')).toBe(false);
    expect(validateUUID('9b1deb4d-3%7d-4bad-9bdd-2b0d7b3d-b6d')).toBe(false);
    expect(validateUUID('d9428888-122b-11e1-b85c-61cd3cbb3210')).toBe(false);
    expect(validateUUID('c106a26a-21bb-5538-8bf2-57095d1976c1')).toBe(false);
    expect(validateUUID('630eb68f-e0fa-5ecc-887a-7c7a62614681')).toBe(false);
  });
});
