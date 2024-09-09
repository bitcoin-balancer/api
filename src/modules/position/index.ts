/* eslint-disable no-console */
import { extractMessage } from 'error-message-utils';
import { BalanceService } from './balance/index.js';
import { IPositionService } from './types.js';

/* ************************************************************************************************
 *                                         IMPLEMENTATION                                         *
 ************************************************************************************************ */

/**
 * Position Service Factory
 * Generates the object in charge of opening, increasing and decreasing positions.
 * @returns IPositionService
 */
const positionServiceFactory = (): IPositionService => {
  /* **********************************************************************************************
   *                                          PROPERTIES                                          *
   ********************************************************************************************** */

  // ...





  /* **********************************************************************************************
   *                                         INITIALIZER                                          *
   ********************************************************************************************** */

  /**
   * Tears down the Position Module.
   * @returns Promise<void>
   */
  const teardown = async (): Promise<void> => {
    // Balance Module
    try {
      await BalanceService.teardown();
    } catch (e) {
      console.error('BalanceService.teardown()', e);
    }

    // ...
  };

  /**
   * Initializes the Position Module.
   * @returns Promise<void>
   */
  const initialize = async (): Promise<void> => {
    try {
      // Balance Module
      try {
        await BalanceService.initialize();
      } catch (e) {
        throw new Error(`BalanceService.initialize() -> ${extractMessage(e)}`);
      }

      // ...
    } catch (e) {
      await teardown();
      throw e;
    }
  };




  /* **********************************************************************************************
   *                                         MODULE BUILD                                         *
   ********************************************************************************************** */
  return Object.freeze({
    // properties
    // ...

    // initializer
    initialize,
    teardown,
  });
};





/* ************************************************************************************************
 *                                        GLOBAL INSTANCE                                         *
 ************************************************************************************************ */
const PositionService = positionServiceFactory();





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  PositionService,
};
