import { INodeEnv } from '../shared/environment/index.js';

/* ************************************************************************************************
 *                                            SERVICE                                             *
 ************************************************************************************************ */

/**
 * Server Service
 * Object in charge of monitoring the temperature|load|usage of the hardware components.
 */
type IServerService = {
  // properties
  state: IServerState;
  alarms: IAlarmsConfiguration;

  // alarms configuration
  updateAlarms: (newConfig: IAlarmsConfiguration) => Promise<void>;

  // initializer
  initialize: (runningVersion: string) => Promise<void>;
  teardown: () => Promise<void>;
};





/* ************************************************************************************************
 *                                             TYPES                                              *
 ************************************************************************************************ */

/**
 * Server State
 * The object containing information regarding the server's runtime environment and resources.
 */
type IServerState = {
  // the server's current time in ms
  time: number;

  // the amount of seconds the server has been running for
  uptime: number;

  // the environment
  environment: INodeEnv;

  // the current version of the Balancer platform
  version: string;

  // cpu's load%
  cpuLoad: number;

  // memory's usage%
  memoryUsage: number;

  // file systems' usage% (it will always pick the drive with highest usage%)
  fileSystemUsage: number;

  // the timestamp in ms of the last time the resources were fetched
  refetchTime: number;
};

/**
 * Alarms Configuration
 * Object containing the limits to what is considered 'Acceptable'. Breaking any of these limits
 * will trigger a notification.
 */
type IAlarmsConfiguration = {
  // highest acceptable load% the CPU
  maxCPULoad: number;

  // highest acceptable usage% of the virtual memory (RAM)
  maxMemoryUsage: number;

  // highest acceptable usage% of the drive's space
  maxFileSystemUsage: number;
};





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export type {
  // service
  IServerService,

  // types
  IServerState,
  IAlarmsConfiguration,
};
