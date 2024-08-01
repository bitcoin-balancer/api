import { IAlarmsConfiguration } from './types.js';

/* ************************************************************************************************
 *                                         IMPLEMENTATION                                         *
 ************************************************************************************************ */

/**
 * Builds the default configuration to be used for the alarms.
 * @returns IAlarmsConfiguration
 */
const buildDefaultAlarms = (): IAlarmsConfiguration => ({
  maxFileSystemUsage: 80,
  maxMemoryUsage: 75,
  maxCPULoad: 75,
  maxCPUTemperature: 70,
});




/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  buildDefaultAlarms,
};
