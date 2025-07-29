import { ENVIRONMENT } from '../../shared/environment/index.js';
import { IUser } from './types.js';

/* ************************************************************************************************
 *                                         IMPLEMENTATION                                         *
 ************************************************************************************************ */

/**
 * Verifies if a value identifies the ROOT_ACCOUNT by uid or nickname.
 * @param val
 * @returns boolean
 */
const isRoot = (val: string | IUser): boolean =>
  (typeof val === 'string' &&
    (val === ENVIRONMENT.ROOT_ACCOUNT.uid || val === ENVIRONMENT.ROOT_ACCOUNT.nickname)) ||
  (Boolean(val) &&
    typeof val === 'object' &&
    (val.uid === ENVIRONMENT.ROOT_ACCOUNT.uid ||
      val.nickname === ENVIRONMENT.ROOT_ACCOUNT.nickname));

/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export { isRoot };
