import { describe, beforeAll, afterAll, beforeEach, afterEach, test, expect, vi } from 'vitest';
import { getString } from './environment.utils.js';

describe('Environment Utilities', () => {
  beforeAll(() => { });

  afterAll(() => { });

  beforeEach(() => { });

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
      expect(() => getString('SOME_KEY')).toThrowError('1');
    });

    test('throws if the value is an empty string', () => {
      vi.stubEnv('SOME_KEY', '');
      expect(() => getString('SOME_KEY')).toThrowError('1');
    });

    test('throws if the value is not accepted', () => {
      vi.stubEnv('SOME_KEY', 'staging');
      expect(() => getString('SOME_KEY', ['development', 'production'])).toThrowError('2');
    });
  });



  describe('getBoolean', () => {
    test.todo('');
  });



  describe('getInteger', () => {
    test.todo('');
  });



  describe('getObject', () => {
    test.todo('');
  });
});