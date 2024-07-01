import process from 'node:process';
import { encodeError, extractMessage } from 'error-message-utils';
import { isInteger } from 'bignumber-utils';

/* ************************************************************************************************
 *                                         IMPLEMENTATION                                         *
 ************************************************************************************************ */

/**
 * Extracts the value of a property from the global process.env object.
 * @param key
 * @param allowedValues?
 * @returns string
 * @throws
 * - 1: if the property does not exist or is an empty string
 * - 2: if the allowedValues array is provided and the value is not included in it
 */
const getString = (key: string, allowedValues?: string[]): string => {
  const val: string | undefined = process.env[key];
  if (typeof val !== 'string' || !val.length) {
    throw new Error(encodeError(`The environment property '${key}' has not been properly set. Received: ${val}`, 1));
  }
  if (Array.isArray(allowedValues) && !allowedValues.includes(val)) {
    throw new Error(encodeError(`The environment property '${key}' has a value of ${val} which is not in the list of allowed values: ${allowedValues}.`, 2));
  }
  return val;
};

/**
 * Extracts a boolean value from the global environment object.
 * @param key
 * @returns boolean
 * @throws
 * - 1: if the property does not exist or is an empty string
 * - 2: if the value is different to 'true' and 'false'
 */
const getBoolean = (key: string): boolean => getString(key, ['true', 'false']) === 'true';

/**
 * Extracts an integer value from the global environment object.
 * @param key
 * @returns number
 * @throws
 * - 1: if the property does not exist or is an empty string
 */
const getInteger = (key: string): number => {
  const val = getString(key);
  if (!isInteger(val)) {
    throw new Error(encodeError(`The environment property '${key}' is not an integer. Received: ${val}`, 3));
  }
  return Number(val);
};

/**
 * Extracts a non-nullable object value from the global environment object.
 * @param key
 * @returns NonNullable<object>
 * @throws
 * - 1: if the property does not exist or is an empty string
 * - 4: if the property is not a valid object
 */
const getObject = (key: string): NonNullable<object> => {
  const val = getString(key);
  try {
    const parsedVal = JSON.parse(val);
    if (!parsedVal || typeof parsedVal !== 'object') {
      throw new Error(`The parsed value is not a valid object. Received: ${parsedVal}`);
    }
    return parsedVal;
  } catch (e) {
    throw new Error(encodeError(`The environment property '${key}' is not an object and could not be parsed. Received: ${val}. Error: ${extractMessage(e)}`, 4));
  }
};





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  getString,
  getBoolean,
  getInteger,
  getObject,
};
