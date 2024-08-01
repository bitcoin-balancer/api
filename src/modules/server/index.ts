import { IServerService } from './types.js';

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
  
  // ...
  const __SOME_CONSTANT = 'I am a constant!';
  
  // ...
  let __someProperty = 123;





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
   * Initializes the Notification Module if the configuration was provided.
   * @returns Promise<void>
   */
  const initialize = async (): Promise<void> => {
    /* // initialize the version build
    await __buildVersion(runningVersion);

    // initialize the refresh interval
    __refreshInterval = setInterval(async () => {
      try {
        await __buildVersion();
      } catch (e) {
        APIErrorService.save('VersionService.initialize.__buildVersion', e);
      }
    }, (__REFRESH_FREQUENCY * (60 * 60)) * 1000); */
  };

  /**
   * Tears down the Version Module if it was initialized.
   * @returns Promise<void>
   */
  const teardown = async (): Promise<void> => {
    /* if (__refreshInterval) {
      clearInterval(__refreshInterval);
    } */
  };




  /* **********************************************************************************************
   *                                         MODULE BUILD                                         *
   ********************************************************************************************** */
  return Object.freeze({
    // properties
    get SOME_CONSTANT() {
      return __SOME_CONSTANT;
    },
    get someProperty() {
      return __someProperty;
    },
    set someProperty(newSomeProperty) {
      __someProperty = newSomeProperty;
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
