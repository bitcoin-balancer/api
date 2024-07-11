import { IObject } from '../shared/types.js';
import { objectValid } from '../shared/validations/index.js';

/* ************************************************************************************************
 *                                         IMPLEMENTATION                                         *
 ************************************************************************************************ */

/**
 * Builds the args object and hides sensitive data based on the sensitiveDataKeys. If args is not a
 * valid object it returns undefined.
 * @param args
 * @param sensitiveDataKeys
 * @returns IObject | undefined
 */
const buildArgs = (args: IObject | undefined, sensitiveDataKeys: string[]): IObject | undefined => (
  objectValid(args)
    ? Object.keys(args).reduce(
      (previous, current) => ({
        ...previous,
        [current]: sensitiveDataKeys.includes(current) ? args[current] : '[SENSITIVE_DATA_HIDDEN]',
      }),
      {},
    )
    : undefined
);





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  buildArgs,
};
