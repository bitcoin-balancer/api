import process from 'node:process';
import { readFileSync } from 'node:fs';
import { extractMessage } from 'error-message-utils';
import { isStringValid, isObjectValid } from 'web-utils-kit';
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
 * - if the property does not exist or is an empty string
 * - if the allowedValues array is provided and the value is not included in it
 */
const getString = (key: string, allowedValues?: string[]): string => {
  const val: string | undefined = process.env[key];
  if (!isStringValid(val, 1)) {
    throw new Error(
      `The environment property '${key}' has not been properly set. Received: ${val}`,
    );
  }
  if (Array.isArray(allowedValues) && !allowedValues.includes(val)) {
    throw new Error(
      `The environment property '${key}' has a value of ${val} which is not in the list of allowed values: ${allowedValues}.`,
    );
  }
  return val;
};

/**
 * Extracts a boolean value from the global environment object.
 * @param key
 * @returns boolean
 * @throws
 * - if the property does not exist or is an empty string
 * - if the value is different to 'true' and 'false'
 */
const getBoolean = (key: string): boolean => getString(key, ['true', 'false']) === 'true';

/**
 * Extracts an integer value from the global environment object.
 * @param key
 * @returns number
 * @throws
 * - if the property does not exist or is an empty string
 */
const getInteger = (key: string): number => {
  const val = getString(key);
  if (!isInteger(val)) {
    throw new Error(`The environment property '${key}' is not an integer. Received: ${val}`);
  }
  return Number(val);
};

/**
 * Extracts an object value from the global environment object.
 * @param key
 * @returns Record<string, any>
 * @throws
 * - if the property does not exist or is an empty string
 * - if the property is not a valid object
 */
const getObject = (key: string): Record<string, any> => {
  const val = getString(key);
  try {
    const parsedVal = JSON.parse(val);
    if (!isObjectValid(parsedVal)) {
      throw new Error(
        `The parsed value is not a valid object. Received: ${JSON.stringify(parsedVal)}`,
      );
    }
    return parsedVal;
  } catch (e) {
    throw new Error(
      `The environment property '${key}' could not be processed: ${extractMessage(e)}. Received: ${val}`,
    );
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
 * - if it fails to extract content from a secret's path
 */
const getSecretString = (key: string): string => {
  const srcPath = getString(key);
  try {
    const content = readFileSync(srcPath, { encoding: 'utf-8' });
    if (!isStringValid(content, 1)) {
      throw new Error(`The secret '${key}' has no content. Received: ${content}`);
    }
    return content;
  } catch (e) {
    throw new Error(`The secret '${srcPath}' could not be processed: ${extractMessage(e)}`);
  }
};

/**
 * Extracts an object value stored in a secret's file.
 * @param key
 * @returns Record<string, any>
 * @throws
 * - if it fails to extract content from a secret's path
 * - if the value cannot be parsed
 */
const getSecretObject = (key: string): Record<string, any> => {
  const val = getSecretString(key);
  try {
    const parsedVal = JSON.parse(val);
    if (!isObjectValid(parsedVal)) {
      throw new Error(
        `The secret parsed value is not a valid object. Received: ${JSON.stringify(parsedVal)}`,
      );
    }
    return parsedVal;
  } catch (e) {
    throw new Error(
      `The secret '${key}' could not be processed: ${extractMessage(e)}. Received: ${val}`,
    );
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
