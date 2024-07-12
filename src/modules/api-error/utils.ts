import { IRecord } from '../shared/types.js';
import { objectValid } from '../shared/validations/index.js';

/* ************************************************************************************************
 *                                         IMPLEMENTATION                                         *
 ************************************************************************************************ */

/**
 * Builds the args object and hides sensitive data based on the sensitiveDataKeys. If args is not a
 * valid object it returns undefined.
 * @param args
 * @param sensitiveDataKeys
 * @returns IRecord | undefined
 */
const buildArgs = (args: IRecord | undefined, sensitiveDataKeys: string[]): IRecord | undefined => (
  objectValid(args)
    ? Object.keys(args).reduce(
      (previous, current) => ({
        ...previous,
        [current]: sensitiveDataKeys.includes(current) ? '[SENSITIVE_DATA_HIDDEN]' : args[current],
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
