import { describe, test, expect } from 'vitest';
import { IMinifiedUser, IUser } from './types.js';
import { isRoot } from './utils.js';


/* ************************************************************************************************
 *                                             TESTS                                              *
 ************************************************************************************************ */
describe('isRoot', () => {
  test.each(<Array<[(string | IUser | IMinifiedUser), boolean]>>[
    // valid root values
    ['eb0d3b94-6a92-4a3d-a176-98163d1b9e5a', true],
    ['root', true],
    [{ uid: 'eb0d3b94-6a92-4a3d-a176-98163d1b9e5a' }, true],
    [{ nickname: 'root' }, true],

    // invalid root values
    ['eb0d3b94-6a92-4a3d-a176-98163d1b9e6a', false],
    ['notroot', false],
    [{ uid: 'eb0d3b94-6a92-4a3d-a176-98163d1b9e7a' }, false],
    [{ nickname: 'notroot' }, false],
  ])('isRoot(%o) -> %s', (a, expected) => {
    expect(isRoot(a)).toBe(expected);
  });
});
