import { recordStoreServiceFactory, IRecordStore } from '../shared/record-store/index.js';
import { buildDefaultAlarms } from './utils.js';
import { IServerService, IAlarmsConfiguration } from './types.js';

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

  // alarms' configuration
  let __alarms: IRecordStore<IAlarmsConfiguration>;

  // the resources will be scanned every __MONITOR_FREQUENCY seconds
  const __MONITOR_FREQUENCY = 120;
  let __monitorInterval: NodeJS.Timeout;





  /* **********************************************************************************************
   *                                            ACTIONS                                           *
   ********************************************************************************************** */

  const someAction = () => {
    // ...
  };





  /* **********************************************************************************************
   *                                          INITIALIZER                                         *
   ********************************************************************************************** */

  /**
   * Initializes the Server Module.
   * @returns Promise<void>
   */
  const initialize = async (): Promise<void> => {
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
    get alarms() {
      return __alarms.value;
    },

    // actions
    someAction,

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
