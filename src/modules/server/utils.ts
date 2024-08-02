import { IAlarmsConfiguration } from './types.js';

/* ************************************************************************************************
 *                                         IMPLEMENTATION                                         *
 ************************************************************************************************ */

/**
 * Builds the default configuration to be used for the alarms.
 * @returns IAlarmsConfiguration
 */
const buildDefaultAlarms = (): IAlarmsConfiguration => ({
  maxCPULoad: 75,
  maxMemoryUsage: 75,
  maxFileSystemUsage: 80,
});




/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  buildDefaultAlarms,
};
