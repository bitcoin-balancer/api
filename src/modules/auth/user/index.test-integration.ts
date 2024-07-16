import { describe, test, expect } from 'vitest';
import { generateUUID } from '../../shared/uuid/index.js';
import { UserService } from './index.js';

/* ************************************************************************************************
 *                                             TESTS                                              *
 ************************************************************************************************ */
describe('isAuthorized', () => {
  test('can create a user and check if it is authorized to perform an action', async () => {
    const user = await UserService.createUser('isAuthorized-1', 4);
    expect(UserService.isAuthorized(user.uid, 1)).toBeUndefined();
    expect(UserService.isAuthorized(user.uid, 2)).toBeUndefined();
    expect(UserService.isAuthorized(user.uid, 3)).toBeUndefined();
    expect(UserService.isAuthorized(user.uid, 4)).toBeUndefined();
  });

  test('throws when checking the authorization state for a user that doesn\'t exist', () => {
    expect(() => UserService.isAuthorized(generateUUID(), 3)).toThrowError('3001');
  });

  test('throws when the user is not authorized to perform the action', async () => {
    const user = await UserService.createUser('isAuthorized-2', 3);
    expect(() => UserService.isAuthorized(user.uid, 4)).toThrowError('3002');
  });
});
