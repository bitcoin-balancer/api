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
 *                                             STATE                                              *
 ************************************************************************************************ */

/**
 * CPU State
 * Information regarding the server's CPU state (all values are in %).
 */
type ICPUState = {
  // average load
  avgLoad: number;

  // CPU load
  currentLoad: number;

  // CPU load user
  currentLoadUser: number;

  // CPU load system
  currentLoadSystem: number;
};

/**
 * Memory State
 * Information regarding the server's virtual memory state (all values are in bytes).
 */
type IMemoryState = {
  // total memory in bytes
  total: number;

  // not used in bytes
  free: number;

  // used actively (excl. buffers/cache)
  active: number;

  // usage% - value populated in the service
  usage: number;
};

/**
 * File System State
 * Information regarding the server's file system drive state (all values are in bytes).
 */
type IFileSystemState = {
  // name of file system
  fs: string;

  // type of file system
  type: string;

  // sizes in bytes
  size: number;

  // used in bytes
  used: number;

  // available in bytes
  available: number;

  // used in %
  use: number;

  // mount point
  mount: string;
};

/**
 * Server State
 * The object containing information regarding the server's runtime environment and resources.
 */
type IServerState = {
  // the amount of seconds the server has been running for
  uptime: number;

  // the environment
  environment: INodeEnv;

  // the current version of the Balancer platform
  version: string;

  // the state of the server's core proccessing unit (CPU)
  cpu: ICPUState;

  // the state of the server's virtual memory (RAM)
  memory: IMemoryState;

  // the state of the server's hard drive (it will always pick the drive with highest usage%)
  fileSystem: IFileSystemState;

  // the timestamp in ms of the last time the resources were fetched
  refetchTime: number;
};





/* ************************************************************************************************
 *                                             ALARMS                                             *
 ************************************************************************************************ */
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

  // state
  ICPUState,
  IMemoryState,
  IFileSystemState,
  IServerState,

  // alarms
  IAlarmsConfiguration,
};
