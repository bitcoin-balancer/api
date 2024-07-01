import process from 'node:process';
import { readFileSync } from 'node:fs';
import { encodeError, extractMessage, isEncodedError } from 'error-message-utils';
import { isInteger } from 'bignumber-utils';

/* ************************************************************************************************
 *                                        READABLE VALUES                                         *
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
      throw new Error(encodeError(`The parsed value is not a valid object. Received: ${parsedVal}`, 7));
    }
    return parsedVal;
  } catch (e) {
    if (isEncodedError(e)) {
      throw e;
    }
    throw new Error(encodeError(`The environment property '${key}' is not an object and could not be parsed. Received: ${val}. Error: ${extractMessage(e)}`, 4));
  }
};





/* ************************************************************************************************
 *                                         SECRET VALUES                                          *
 ************************************************************************************************ */

/**
 * Extracts a string value stored in a secret's file.
 * @param key
 * @returns string
 * @throws
 * - 5, 7: if it fails to extract content from a secret's path
 */
const getSecretString = (key: string): string => {
  const srcPath = getString(key);
  try {
    const content = readFileSync(srcPath, { encoding: 'utf8' });
    if (typeof content !== 'string' || !content.length) {
      throw new Error(encodeError(`The secret '${srcPath}' has no content. Received: ${content}`, 7));
    }
    return content;
  } catch (e) {
    if (isEncodedError(e)) {
      throw e;
    }
    throw new Error(encodeError(`The secret '${srcPath}' could not be read. ${extractMessage(e)}`, 5));
  }
};

/**
 * Extracts an object value stored in a secret's file.
 * @param key
 * @returns NonNullable<object>
 * @throws
 * - 5, 7: if it fails to extract content from a secret's path
 * - 8: if the value cannot be parsed
 */
const getSecretObject = (key: string): NonNullable<object> => {
  const val = getSecretString(key);
  try {
    const parsedVal = JSON.parse(val);
    if (!parsedVal || typeof parsedVal !== 'object') {
      throw new Error(encodeError(`The secret parsed value is not a valid object. Received: ${parsedVal}`, 8));
    }
    return parsedVal;
  } catch (e) {
    if (isEncodedError(e)) {
      throw e;
    }
    throw new Error(encodeError(`The secret '${key}' could not be read. ${extractMessage(e)}`, 5));
  }
};





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  // readable values
  getString,
  getBoolean,
  getInteger,
  getObject,

  // secret values
  getSecretString,
  getSecretObject,
};
