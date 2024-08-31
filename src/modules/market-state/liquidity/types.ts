

/* ************************************************************************************************
 *                                           SERVICES                                             *
 ************************************************************************************************ */

/**
 * Liquidity Service
 * Object in charge of keeping Balancer in sync with the base asset's order book and calculating its
 * state.
 */
type ILiquidityService = {
  // properties
  config: ILiquidityConfig;

  // state calculator
  /* calculateState: () => any;
  getPristineState: () => any; */

  // initializer
  initialize: () => Promise<void>;
  teardown: () => Promise<void>;

  // configuration
  updateConfiguration: (newConfig: ILiquidityConfig) => Promise<void>;
};




/* ************************************************************************************************
 *                                             TYPES                                              *
 ************************************************************************************************ */

/**
 * Liquidity Intensity
 * The intensity of the liquidity within a price level.
 */
type ILiquidityIntensity = 0 | 1 | 2 | 3 | 4;

/**
 * Liquidity Intensity Weights
 * The weights that will be used to determine the value of each intensity
 * when calculating the state.
 */
type ILiquidityIntensityWeights = {
  1: number;
  2: number;
  3: number;
  4: number;
};





/* ************************************************************************************************
 *                                             STATE                                              *
 ************************************************************************************************ */





/* ************************************************************************************************
 *                                         CONFIGURATION                                          *
 ************************************************************************************************ */

/**
 * Liquidity Config
 * The object containing the configuration that will be used to process the order book and calculate
 * its state.
 */
type ILiquidityConfig = {
  // the percentage to calculate the range (+|-) that will be used to calculate the state
  maxDistanceFromPrice: number;

  // the weights by intensity that will be used to calculate the state
  intensityWeights: ILiquidityIntensityWeights;
};





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export type {
  // services
  ILiquidityService,

  // types
  ILiquidityIntensity,
  ILiquidityIntensityWeights,

  // state

  // configuration
  ILiquidityConfig,
};
