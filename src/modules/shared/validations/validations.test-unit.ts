import { describe, test, expect } from 'vitest';
import { usernameValid } from './validations.js';

/* ************************************************************************************************
 *                                             TESTS                                              *
 ************************************************************************************************ */

describe('usernameValid', () => {
  test.each([
    'jesusgraterol', 'JESUSGRATEROL', 'Jes15-Graterol_.', 'je', '15', 'xD', '__', 'Herassio-.',
    'PythonWiz333', 'restAPI12.-_',
  ])('usernameValid(%s) -> true', (a) => {
    expect(usernameValid(a)).toBe(true);
  });

  test.each([
    undefined, null, {}, [], 'a', 'JESUSGRATEROL@', 'Jes15-Gratero_.!', '@@', 'Jes15-Gratero_.as',
    'jesu()', 'asdjkhxaslkdj546512asdkasd',
  ])('usernameValid(%s) -> false', (a) => {
    expect(usernameValid(<string>a)).toBe(false);
  });
});
