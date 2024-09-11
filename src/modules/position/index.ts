/* eslint-disable no-console */
import { Subscription } from 'rxjs';
import { extractMessage } from 'error-message-utils';
import { MarketStateService, IMarketState } from '../market-state/index.js';
import { StrategyService } from './strategy/index.js';
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

  // the number of decimal places the base asset can have
  const __BASE_ASSET_DP = 4;

  // the minimum amount of the base asset that can bought or sold
  const __MIN_ORDER_SIZE = 0.0001;

  // the subscription to the market state stream
  let __marketStateSub: Subscription;





  /* **********************************************************************************************
   *                                     MARKET STATE STREAM                                      *
   ********************************************************************************************** */

  /**
   * Fires whenever a new market state is calculated.
   * @param nextState
   */
  const __onMarketStateChanges = (nextState: IMarketState): void => {

  };





  /* **********************************************************************************************
   *                                         INITIALIZER                                          *
   ********************************************************************************************** */

  /**
   * Tears down the Position Module.
   * @returns Promise<void>
   */
  const teardown = async (): Promise<void> => {
    // unsubscribe from the market state stream
    __marketStateSub?.unsubscribe();

    // Strategy Module
    try {
      await StrategyService.teardown();
    } catch (e) {
      console.error('StrategyService.teardown()', e);
    }

    // Balance Module
    try {
      await BalanceService.teardown();
    } catch (e) {
      console.error('BalanceService.teardown()', e);
    }

    // Trade Module
    try {
      // await TradeService.teardown();
    } catch (e) {
      console.error('TradeService.teardown()', e);
    }

    // ...
  };

  /**
   * Initializes the Position Module.
   * @returns Promise<void>
   */
  const initialize = async (): Promise<void> => {
    try {
      // Strategy Module
      try {
        await StrategyService.initialize();
      } catch (e) {
        throw new Error(`StrategyService.initialize() -> ${extractMessage(e)}`);
      }

      // Balance Module
      try {
        await BalanceService.initialize();
      } catch (e) {
        throw new Error(`BalanceService.initialize() -> ${extractMessage(e)}`);
      }

      // Trade Module
      try {
        // ...
      } catch (e) {
        throw new Error(`TradeService.initialize() -> ${extractMessage(e)}`);
      }

      // subscribe to the market state stream
      __marketStateSub = MarketStateService.subscribe(__onMarketStateChanges);
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
