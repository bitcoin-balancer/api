import { isObjectValid } from 'web-utils-kit';

/* ************************************************************************************************
 *                                         IMPLEMENTATION                                         *
 ************************************************************************************************ */

/**
 * Builds the args object and hides sensitive data based on the sensitiveDataKeys. If args is not a
 * valid object it returns undefined.
 * @param args
 * @param sensitiveDataKeys
 * @returns Record<string, any> | undefined
 */
const buildArgs = (
  args: Record<string, any> | undefined,
  sensitiveDataKeys: string[],
): Record<string, any> | undefined =>
  isObjectValid(args)
    ? Object.keys(args).reduce(
        (previous, current) => ({
          ...previous,
          [current]: sensitiveDataKeys.includes(current)
            ? '[SENSITIVE_DATA_HIDDEN]'
            : args[current],
        }),
        {},
      )
    : undefined;

/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export { buildArgs };
