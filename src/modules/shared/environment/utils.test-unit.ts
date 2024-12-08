import { describe, afterEach, test, expect, vi } from 'vitest';
import { getBoolean, getInteger, getObject, getString } from './utils.js';

describe('Environment Utilities', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe('getString', () => {
    test('can extract a string', () => {
      vi.stubEnv('SOME_KEY', 'development');
      expect(getString('SOME_KEY')).toBe('development');
    });

    test('can extract a string constrained to certain values', () => {
      vi.stubEnv('SOME_KEY', 'production');
      expect(getString('SOME_KEY', ['development', 'production'])).toBe('production');
    });

    test('throws if the value is not in the env vars', () => {
      expect(() => getString('SOME_KEY')).toThrowError('The environment property \'SOME_KEY\'');
    });

    test('throws if the value is an empty string', () => {
      vi.stubEnv('SOME_KEY', '');
      expect(() => getString('SOME_KEY')).toThrowError('The environment property \'SOME_KEY\'');
    });

    test('throws if the value is not accepted', () => {
      vi.stubEnv('SOME_KEY', 'staging');
      expect(() => getString('SOME_KEY', ['development', 'production'])).toThrowError('The environment property \'SOME_KEY\'');
    });
  });



  describe('getBoolean', () => {
    test('can extract a boolean value', () => {
      vi.stubEnv('SOME_KEY', 'true');
      expect(getBoolean('SOME_KEY')).toBe(true);
      vi.stubEnv('SOME_KEY', 'false');
      expect(getBoolean('SOME_KEY')).toBe(false);
    });

    test('throws if the value is not in the env vars', () => {
      expect(() => getBoolean('SOME_KEY')).toThrowError('The environment property \'SOME_KEY\'');
    });

    test('throws if the value is not true or false', () => {
      vi.stubEnv('SOME_KEY', 'something');
      expect(() => getBoolean('SOME_KEY')).toThrowError('The environment property \'SOME_KEY\'');
    });
  });



  describe('getInteger', () => {
    test('can extract a boolean value', () => {
      vi.stubEnv('SOME_KEY', '5075');
      expect(getInteger('SOME_KEY')).toBe(5075);
    });

    test('throws if the value is not in the env vars', () => {
      expect(() => getInteger('SOME_KEY')).toThrowError('The environment property \'SOME_KEY\'');
    });

    test('throws if the value is not an integer', () => {
      vi.stubEnv('SOME_KEY', '100.55');
      expect(() => getInteger('SOME_KEY')).toThrowError('The environment property \'SOME_KEY\'');
    });
  });



  describe('getObject', () => {
    test('can extract an object value', () => {
      const obj = { id: 12, secret: 'asdasjk1231' };
      vi.stubEnv('SOME_KEY', JSON.stringify(obj));
      expect(getObject('SOME_KEY')).toStrictEqual(obj);
    });

    test('throws if the value is not in the env vars', () => {
      expect(() => getObject('SOME_KEY')).toThrowError('The environment property \'SOME_KEY\'');
    });

    test('throws if the value is not an object (1)', () => {
      vi.stubEnv('SOME_KEY', '100.55');
      expect(() => getObject('SOME_KEY')).toThrowError('The environment property \'SOME_KEY\'');
    });

    test('throws if the value is not an object (2)', () => {
      vi.stubEnv('SOME_KEY', '[1,2,3]');
      expect(() => getObject('SOME_KEY')).toThrowError('The environment property \'SOME_KEY\'');
    });
  });
});
