import { encodeError } from 'error-message-utils';
import { numberValid, objectValid } from '../shared/validations/index.js';
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
 * - 8254: if the maxCPUTemperature is invalid
 */
const canAlarmsBeUpdated = (config: IAlarmsConfiguration): void => {
  if (!objectValid(config)) {
    console.log(config);
    throw new Error(encodeError('The alarms configuration is not a valid object.', 8250));
  }
  if (!numberValid(config.maxFileSystemUsage, 30, 99)) {
    throw new Error(encodeError(`The maxFileSystemUsage must be a number ranging 30-99. Received: ${config.maxFileSystemUsage}`, 8251));
  }
  if (!numberValid(config.maxMemoryUsage, 30, 99)) {
    throw new Error(encodeError(`The maxMemoryUsage must be a number ranging 30-99. Received: ${config.maxMemoryUsage}`, 8252));
  }
  if (!numberValid(config.maxCPULoad, 30, 99)) {
    throw new Error(encodeError(`The maxCPULoad must be a number ranging 30-99. Received: ${config.maxMemoryUsage}`, 8253));
  }
  if (!numberValid(config.maxCPUTemperature, 50, 90)) {
    throw new Error(encodeError(`The maxCPUTemperature must be a number ranging 50-90. Received: ${config.maxMemoryUsage}`, 8254));
  }
};





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  canAlarmsBeUpdated,
};
