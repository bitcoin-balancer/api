/* eslint-disable no-console */
import { BehaviorSubject, Subscription } from 'rxjs';
import { extractMessage } from 'error-message-utils';
import { APIErrorService } from '../api-error/index.js';
import { NotificationService, throttleableNotificationFactory } from '../notification/index.js';
import { WindowService } from './window/index.js';
import { buildPristineState } from './utils.js';
import { IMarketStateService, IMarketState } from './types.js';

/* ************************************************************************************************
 *                                         IMPLEMENTATION                                         *
 ************************************************************************************************ */

/**
 * Market State Service Factory
 * Generates the object in charge of brokering the state calculation across all the modules.
 * @returns IMarketStateService
 */
const marketStateServiceFactory = (): IMarketStateService => {
  /* **********************************************************************************************
   *                                          PROPERTIES                                          *
   ********************************************************************************************** */

  // the subscription to the window stream
  let __windowSub: Subscription;

  // the market state stream that will be calculated and broadcasted on window changes
  const __state = new BehaviorSubject(buildPristineState());

  // if there is an error during the calculation of the market state, a notification is sent
  const __errorNotification = throttleableNotificationFactory(
    NotificationService.marketStateError,
    5,
  );



  /* **********************************************************************************************
   *                                       STATE CALCULATOR                                       *
   ********************************************************************************************** */

  /**
   * Fires whenever the window is synced. It calculates the state for all the submodules and
   * broadcasts the new state.
   */
  const __onWindowChanges = (): void => {
    try {
      // calculate the window state
      const windowState = WindowService.calculateState();

      // calculate the liquidity state
      // const liquidityState = LiquidityService.calculateState(windowState.window.close.at(-1));

      // calculate the coins' state
      // const { coins, coinsBTC } = CoinsService.calculateState();

      // calculate the reversal state
      // const reversalState = ReversalService.calculateState(liquidityState, coins, coinsBTC);

      // finally, broadcast the next state
      __state.next({
        windowState,
      });
    } catch (e) {
      console.error(e);
      const msg = extractMessage(e);
      APIErrorService.save('MarketStateService.__onWindowChanges', msg);
      __errorNotification.broadcast([msg]);
    }
  };





  /* **********************************************************************************************
   *                                         INITIALIZER                                          *
   ********************************************************************************************** */

  /**
   * Tears down the Market State Module.
   * @returns Promise<void>
   */
  const teardown = async (): Promise<void> => {
    // Window Module
    try {
      if (__windowSub) {
        __windowSub.unsubscribe();
      }
      await WindowService.teardown();
    } catch (e) {
      console.error('WindowService.teardown()', e);
    }

    // Liquidity Module
    try {
      // await LiquidityService.teardown(); @TODO
    } catch (e) {
      console.error('LiquidityService.teardown()', e);
    }

    // Coins Module
    try {
      // await CoinsService.teardown(); @TODO
    } catch (e) {
      console.error('CoinsService.teardown()', e);
    }

    // Reversal Module
    try {
      // await ReversalService.teardown(); @TODO
    } catch (e) {
      console.error('ReversalService.teardown()', e);
    }
  };

  /**
   * Initializes the Market State Module.
   * @returns Promise<void>
   */
  const initialize = async (): Promise<void> => {
    try {
      // Window Module
      try {
        await WindowService.initialize();
      } catch (e) {
        throw new Error(`WindowService.initialize() -> ${extractMessage(e)}`);
      }

      // Liquidity Module
      try {
        // await LiquidityService.initialize();
      } catch (e) {
        throw new Error(`LiquidityService.initialize() -> ${extractMessage(e)}`);
      }

      // Coins Module
      try {
        // await CoinsService.initialize();
      } catch (e) {
        throw new Error(`CoinsService.initialize() -> ${extractMessage(e)}`);
      }

      // Reversal Module
      try {
        // await ReversalService.initialize();
      } catch (e) {
        throw new Error(`ReversalService.initialize() -> ${extractMessage(e)}`);
      }

      // subscribe to the window
      __windowSub = WindowService.window.subscribe(__onWindowChanges);
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
    get state() {
      return __state;
    },

    // initializer
    teardown,
    initialize,
  });
};





/* ************************************************************************************************
 *                                        GLOBAL INSTANCE                                         *
 ************************************************************************************************ */
const MarketStateService = marketStateServiceFactory();





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  // service
  MarketStateService,

  // types
  type IMarketState,
};
