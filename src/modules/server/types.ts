

/* ************************************************************************************************
 *                                            SERVICE                                             *
 ************************************************************************************************ */

/**
 * Server Service
 * Object in charge of monitoring the temperature|load|usage of the hardware components.
 */
type IServerService = {
  // properties
  alarms: IAlarmsConfiguration;

  // initializer
  initialize: () => Promise<void>;
  teardown: () => Promise<void>;
};





/* ************************************************************************************************
 *                                             TYPES                                              *
 ************************************************************************************************ */

/**
 * Alarms Configuration
 * Object containing the limits to what is considered 'Acceptable'. Breaking any of these limits
 * will trigger a notification.
 */
type IAlarmsConfiguration = {
  // highest acceptable usage% of the drive's space
  maxFileSystemUsage: number;

  // highest acceptable usage% of the virtual memory (RAM)
  maxMemoryUsage: number;

  // highest acceptable load% the CPU
  maxCPULoad: number;

  // highest acceptable temp (celcius degrees) the CPU can experience
  maxCPUTemperature: number;
};





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export type {
  // service
  IServerService,

  // types
  IAlarmsConfiguration,
};
