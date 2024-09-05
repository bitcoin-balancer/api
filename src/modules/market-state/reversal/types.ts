

/* ************************************************************************************************
 *                                            SERVICE                                             *
 ************************************************************************************************ */

/**
 * Reversal Service
 * Object in charge of evaluating if a price crash has the potential to reverse.
 */
type IReversalService = {
  // properties
  config: IReversalConfig,

  // initializer
  initialize: () => Promise<void>;
  teardown: () => Promise<void>;

  // configuration
  updateConfiguration: (newConfig: IReversalConfig) => Promise<void>;
};




/* ************************************************************************************************
 *                                             TYPES                                              *
 ************************************************************************************************ */

// ...





/* ************************************************************************************************
 *                                             STATE                                              *
 ************************************************************************************************ */

// ...





/* ************************************************************************************************
 *                                         CONFIGURATION                                          *
 ************************************************************************************************ */

/**
 * Reversal Point Weights
 * The object that indicates the "importance" of each module. It is used to calculate the likelihood
 * of a price reversal taking place. Keep in mind the sum of these properties must be equals to 100.
 */
type IReversalPointWeights = {
  // the max. number of points that can be obtained via the liquidity module
  liquidity: number;

  // the max. number of points that can be obtained via the coins module (COINS/USDT)
  coinsQuote: number;

  // the max. number of points that can be obtained via the coins module (COINS/BTC)
  coinsBase: number;
};

/**
 * Reversal Config
 * The object containing the configuration that will be used to detect and manage the price crash
 * state. It is also used to evaluate the likelihood of the price reversing.
 */
type IReversalConfig = {
  // the number of minutes the price crash state will be active for. Once the time runs out, the
  // record is stored in the database and the state is reset.
  crashDuration: number;

  // the number of minutes Balancer will wait before being able to activate the price crash state
  // again
  crashIdleDuration: number;

  // the total number of points required for a reversal event to be issued
  pointsRequirement: number;

  // the weights by module used to calculate the points
  weights: IReversalPointWeights;
};





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export type {
  // service
  IReversalService,

  // types

  // state

  // configuration
  IReversalPointWeights,
  IReversalConfig,
};
