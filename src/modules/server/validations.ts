/* eslint-disable no-console */
import { encodeError } from 'error-message-utils';
import { isNumberValid, isObjectValid } from 'web-utils-kit';
import { IAlarmsConfiguration } from './types.js';

/* ************************************************************************************************
 *                                         IMPLEMENTATION                                         *
 ************************************************************************************************ */

/**
 * Verifies if the alarms' configuration can be updated.
 * @param config
 * @throws
 * - 8250: if the configuration is not a valid object
 * - 8251: if the maxFileSystemUsage is invalid
 * - 8252: if the maxMemoryUsage is invalid
 * - 8253: if the maxCPULoad is invalid
 */
const canAlarmsBeUpdated = (config: IAlarmsConfiguration): void => {
  if (!isObjectValid(config)) {
    console.log(config);
    throw new Error(encodeError('The alarms configuration is not a valid object.', 8250));
  }
  if (!isNumberValid(config.maxFileSystemUsage, 30, 99)) {
    throw new Error(encodeError(`The maxFileSystemUsage must be a number ranging 30-99. Received: ${config.maxFileSystemUsage}`, 8251));
  }
  if (!isNumberValid(config.maxMemoryUsage, 30, 99)) {
    throw new Error(encodeError(`The maxMemoryUsage must be a number ranging 30-99. Received: ${config.maxMemoryUsage}`, 8252));
  }
  if (!isNumberValid(config.maxCPULoad, 30, 99)) {
    throw new Error(encodeError(`The maxCPULoad must be a number ranging 30-99. Received: ${config.maxMemoryUsage}`, 8253));
  }
};





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  canAlarmsBeUpdated,
};
