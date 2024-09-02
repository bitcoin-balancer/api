import { IRecordStore, recordStoreFactory } from '../../shared/record-store/index.js';
import {
  calculatePriceRange,
  calculateIntensityRequirements,
  calculateBidDominance,
  buildPristineState,
  buildPristineCompactState,
  buildDefaultConfig,
  processPriceLevel,
} from './utils.js';
import { canConfigBeUpdated } from './validations.js';
import { orderBookServiceFactory } from './order-book.js';
import {
  ILiquidityService,
  IOrderBookService,
  ICompactLiquidityState,
  ILiquidityState,
  ILiquidityConfig,
  ILiquidityPriceLevel,
} from './types.js';

/* ************************************************************************************************
 *                                         IMPLEMENTATION                                         *
 ************************************************************************************************ */

/**
 * Liquidity Service Factory
 * Generates the object in charge of keeping Balancer in sync with the base asset's order book and
 * calculating its state.
 * @returns ILiquidityService
 */
const liquidityServiceFactory = (): ILiquidityService => {
  /* **********************************************************************************************
   *                                          PROPERTIES                                          *
   ********************************************************************************************** */

  // the instance of the order book real-time data
  let __orderBook: IOrderBookService;

  // the up-to-date state of the module
  const __state: ILiquidityState = buildPristineState();

  // the liq. intensity requirements are calculated every REQUIREMENT_CALCULATION_FREQUENCY minutes
  let __nextRequirementsCalculation: number | undefined;
  const __REQUIREMENT_CALCULATION_FREQUENCY = 2;

  // the module's configuration
  let __config: IRecordStore<ILiquidityConfig>;





  /* **********************************************************************************************
   *                                       STATE CALCULATOR                                       *
   ********************************************************************************************** */

  /**
   * Recalculates the intensity requirements and sets the date for the next recalculation.
   * @param levels
   * @param currentTime
   */
  const __recalculateRequirements = (levels: ILiquidityPriceLevel[]): void => {
    const ts = Date.now();
    if (!__nextRequirementsCalculation || ts >= __nextRequirementsCalculation) {
      __state.intensityRequirements = calculateIntensityRequirements(levels);
      __nextRequirementsCalculation = ts + ((__REQUIREMENT_CALCULATION_FREQUENCY * 60) * 1000);
    }
  };

  /**
   * Syncs the local state with the latest state of the order book.
   */
  const __syncLiquiditySides = (): void => {
    // retrieve the up-to-date liquidity sides
    const { asks, bids } = __orderBook.getPreProcessedLiquiditySides(__state.priceRange);

    // recalculate requirements (if due)
    __recalculateRequirements(asks.levels.concat(bids.levels));

    // process and set the price levels
    __state.asks = {
      total: asks.total,
      levels: asks.levels.map((level) => processPriceLevel(level, __state.intensityRequirements)),
    };
    __state.bids = {
      total: bids.total,
      levels: bids.levels.map((level) => processPriceLevel(level, __state.intensityRequirements)),
    };
  };

  /**
   * Calculates the liquidity state based on the current rate.
   * @param baseAssetPrice
   * @returns ICompactLiquidityState
   */
  const calculateState = (baseAssetPrice: number): ICompactLiquidityState => {
    // calculate the price range
    __state.priceRange = calculatePriceRange(baseAssetPrice, __config.value.maxDistanceFromPrice);

    // sync both liquidity sides
    __syncLiquiditySides();

    // identify the liquidity peaks and calculate the bid dominance
    __state.bidDominance = calculateBidDominance(
      __state.asks.levels,
      __state.bids.levels,
      __config.value.intensityWeights,
    );

    // update the latest refetch timestamp for debugging purposes
    __state.lastRefetch = __orderBook.lastRefetch;

    // finally, return the compact state
    return { bidDominance: __state.bidDominance };
  };


  /**
   * Builds the default liquidity state.
   * @returns ICompactLiquidityState
   */
  const getPristineState = (): ICompactLiquidityState => buildPristineCompactState();





  /* **********************************************************************************************
   *                                         INITIALIZER                                          *
   ********************************************************************************************** */

  /**
   * Initializes the Liquidity Module.
   * @returns Promise<void>
   */
  const initialize = async (): Promise<void> => {
    // initialize the configuration
    __config = await recordStoreFactory('LIQUIDITY', buildDefaultConfig());

    // initialize the order book stream
    __orderBook = await orderBookServiceFactory();
  };

  /**
   * Tears down the Liquidity Module.
   * @returns Promise<void>
   */
  const teardown = async (): Promise<void> => {
    // clearInterval(__refetchInterval);
    __orderBook?.off();
  };





  /* **********************************************************************************************
   *                                        CONFIGURATION                                         *
   ********************************************************************************************** */

  /**
   * Updates the configuration of the module.
   * @param newConfig
   * @throws
   * - 22500: if the new config is not a valid object
   * - 22501: if the max distance from price is invalid
   * - 22502: if the intensity weights is not a valid object
   * - 22503: if any of the intensity weights is invalid
   */
  const updateConfiguration = async (newConfig: ILiquidityConfig): Promise<void> => {
    canConfigBeUpdated(newConfig);
    await __config.update(newConfig);
  };





  /* **********************************************************************************************
   *                                         MODULE BUILD                                         *
   ********************************************************************************************** */
  return Object.freeze({
    // properties
    get state() {
      return __state;
    },
    get config() {
      return __config.value;
    },

    // state calculator
    calculateState,
    getPristineState,

    // initializer
    initialize,
    teardown,

    // configuration
    updateConfiguration,
  });
};





/* ************************************************************************************************
 *                                        GLOBAL INSTANCE                                         *
 ************************************************************************************************ */
const LiquidityService = liquidityServiceFactory();





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  // service
  LiquidityService,

  // types
  type ICompactLiquidityState,
};
