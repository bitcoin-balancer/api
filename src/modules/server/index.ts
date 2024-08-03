import { ENVIRONMENT } from '../shared/environment/index.js';
import { recordStoreServiceFactory, IRecordStore } from '../shared/record-store/index.js';
import { buildDefaultAlarms } from './utils.js';
import { IServerService, IAlarmsConfiguration, IServerState } from './types.js';
import { canAlarmsBeUpdated } from './validations.js';
import { scanResources } from './scanner.js';

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

  // the running version of the API
  let __runningVersion: string;

  // server's runtime environment and resources info
  let __state: IServerState;

  // alarms' configuration
  let __alarms: IRecordStore<IAlarmsConfiguration>;

  // the resources will be scanned every __REFETCH_FREQUENCY seconds
  const __REFETCH_FREQUENCY = 120;
  let __refetchInterval: NodeJS.Timeout;





  /* **********************************************************************************************
   *                                       STATE PROCESSING                                       *
   ********************************************************************************************** */

  // ...

  const __refetchState = async (runningVersion?: string): Promise<void> => {
    // scan the resources
    const resources = await scanResources();

    // check the current values against the alarms' configuration
    // @TODO

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
    // initialize the running version
    __runningVersion = runningVersion;

    // initialize the alarms' configuration
    __alarms = await recordStoreServiceFactory('SERVER_ALARMS', buildDefaultAlarms());

    // initialize the monitor interval
    __refetchInterval = setInterval(async () => {
      try {
        // @TODO
      } catch (e) {
        // APIErrorService.save('VersionService.initialize.__buildVersion', e);
      }
    }, __REFETCH_FREQUENCY * 1000);
  };

  /**
   * Tears down the Version Module if it was initialized.
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
