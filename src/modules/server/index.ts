import ms from 'ms';
import { ENVIRONMENT } from '../shared/environment/index.js';
import { recordStoreFactory, IRecordStore } from '../shared/record-store/index.js';
import { APIErrorService } from '../api-error/index.js';
import { NotificationService } from '../notification/index.js';
import { buildDefaultAlarms } from './utils.js';
import { canAlarmsBeUpdated } from './validations.js';
import { scanResources } from './scanner.js';
import {
  IServerService,
  IAlarmsConfiguration,
  IServerState, ICPUState,
  IMemoryState,
  IFileSystemState,
} from './types.js';

/* ************************************************************************************************
 *                                         IMPLEMENTATION                                         *
 ************************************************************************************************ */

/**
 * Server Service Factory
 * Generates the object in charge of monitoring the temperature|load|usage of the hardware
 * components.
 * @returns IServerService
 */
const serverServiceFactory = (): IServerService => {
  /* **********************************************************************************************
   *                                          PROPERTIES                                          *
   ********************************************************************************************** */

  // server's runtime environment and resources info
  let __state: IServerState;

  // alarms' configuration
  let __alarms: IRecordStore<IAlarmsConfiguration>;

  // the resources will be scanned every __REFETCH_FREQUENCY seconds
  const __REFETCH_FREQUENCY = 60;
  let __refetchInterval: NodeJS.Timeout;





  /* **********************************************************************************************
   *                                       STATE PROCESSING                                       *
   ********************************************************************************************** */

  /**
   * Checks if the CPU is in an acceptable state, otherwise, it broadcasts a notification.
   * @param state
   */
  const __checkCPUState = (state: ICPUState): void => {
    if (
      state.avgLoad > __alarms.value.maxCPULoad
      || state.currentLoad > __alarms.value.maxCPULoad
    ) {
      NotificationService.highCPULoad(
        state.avgLoad > state.currentLoad ? state.avgLoad : state.currentLoad,
        __alarms.value.maxCPULoad,
      );
    }
  };

  /**
   * Checks if the Memory is in an acceptable state, otherwise, it broadcasts a notification.
   * @param state
   */
  const __checkMemoryState = (state: IMemoryState): void => {
    if (state.usage > __alarms.value.maxMemoryUsage) {
      NotificationService.highMemoryUsage(state.usage, __alarms.value.maxMemoryUsage);
    }
  };

  /**
   * Checks if the File System is in an acceptable state, otherwise, it broadcasts a notification.
   * @param state
   */
  const __checkFileSystemState = (state: IFileSystemState): void => {
    if (state.use > __alarms.value.maxFileSystemUsage) {
      NotificationService.highFileSystemUsage(state.use, __alarms.value.maxFileSystemUsage);
    }
  };

  /**
   * Scans, checks and updates the state for the resources.
   * @param runningVersion?
   * @returns Promise<void>
   */
  const __refetchState = async (runningVersion?: string): Promise<void> => {
    // scan the resources
    const resources = await scanResources();

    // check the current values against the alarms' configuration
    __checkCPUState(resources.cpu);
    __checkMemoryState(resources.memory);
    __checkFileSystemState(resources.fileSystem);

    // set / update the state accordingly
    if (runningVersion) {
      __state = {
        uptime: resources.uptime,
        environment: ENVIRONMENT.NODE_ENV,
        version: runningVersion,
        cpu: resources.cpu,
        memory: resources.memory,
        fileSystem: resources.fileSystem,
        refetchTime: Date.now(),
      };
    } else {
      __state.uptime = resources.uptime;
      __state.cpu = resources.cpu;
      __state.memory = resources.memory;
      __state.fileSystem = resources.fileSystem;
      __state.refetchTime = Date.now();
    }
  };





  /* **********************************************************************************************
   *                                     ALARMS CONFIGURATION                                     *
   ********************************************************************************************** */

  /**
   * Validates and updates the alarms' configuration.
   * @param newConfig
   * @throws
   * - 8250: if the configuration is not a valid object
   * - 8251: if the maxFileSystemUsage is invalid
   * - 8252: if the maxMemoryUsage is invalid
   * - 8253: if the maxCPULoad is invalid
   */
  const updateAlarms = async (newConfig: IAlarmsConfiguration): Promise<void> => {
    canAlarmsBeUpdated(newConfig);
    await __alarms.update(newConfig);
  };





  /* **********************************************************************************************
   *                                          INITIALIZER                                         *
   ********************************************************************************************** */

  /**
   * Initializes the Server Module.
   * @param runningVersion
   * @returns Promise<void>
   */
  const initialize = async (runningVersion: string): Promise<void> => {
    // initialize the alarms' configuration
    __alarms = await recordStoreFactory('SERVER_ALARMS', buildDefaultAlarms());

    // initialize the state
    await __refetchState(runningVersion);

    // initialize the refetch interval
    __refetchInterval = setInterval(async () => {
      try {
        await __refetchState();
      } catch (e) {
        APIErrorService.save('ServerService.initialize.__refetchState', e);
      }
    }, ms(`${__REFETCH_FREQUENCY} seconds`));
  };

  /**
   * Tears down the Server Module if it was initialized.
   * @returns Promise<void>
   */
  const teardown = async (): Promise<void> => {
    if (__refetchInterval) {
      clearInterval(__refetchInterval);
    }
  };





  /* **********************************************************************************************
   *                                         MODULE BUILD                                         *
   ********************************************************************************************** */
  return Object.freeze({
    // properties
    get state() {
      return __state;
    },
    get alarms() {
      return __alarms.value;
    },

    // alarms configuration
    updateAlarms,

    // initializer
    initialize,
    teardown,
  });
};





/* ************************************************************************************************
 *                                        GLOBAL INSTANCE                                         *
 ************************************************************************************************ */
const ServerService = serverServiceFactory();





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  ServerService,
};
