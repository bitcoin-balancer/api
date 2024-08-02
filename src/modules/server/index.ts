import { recordStoreServiceFactory, IRecordStore } from '../shared/record-store/index.js';
import { buildDefaultAlarms } from './utils.js';
import { IServerService, IAlarmsConfiguration, IServerState } from './types.js';
import { canAlarmsBeUpdated } from './validations.js';

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

  // the resources will be scanned every __MONITOR_FREQUENCY seconds
  const __MONITOR_FREQUENCY = 120;
  let __monitorInterval: NodeJS.Timeout;





  /* **********************************************************************************************
   *                                       STATE PROCESSING                                       *
   ********************************************************************************************** */

  // ...




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
    __monitorInterval = setInterval(async () => {
      try {
        // @TODO
      } catch (e) {
        // APIErrorService.save('VersionService.initialize.__buildVersion', e);
      }
    }, __MONITOR_FREQUENCY * 1000);
  };

  /**
   * Tears down the Version Module if it was initialized.
   * @returns Promise<void>
   */
  const teardown = async (): Promise<void> => {
    if (__monitorInterval) {
      clearInterval(__monitorInterval);
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