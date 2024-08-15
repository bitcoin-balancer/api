

/* ************************************************************************************************
 *                                            SERVICE                                             *
 ************************************************************************************************ */

/**
 * Window Service
 * Object in charge of keeping Balancer in sync with the market's candlesticks and calculating its
 * state.
 */
type IWindowService = {
  // properties
  config: IWindowConfig;

  // configurtion
  updateConfiguration: (newConfig: IWindowConfig) => Promise<void>;

  // initializer
  initialize: () => Promise<void>;
  teardown: () => Promise<void>;
};





/* ************************************************************************************************
 *                                             TYPES                                              *
 ************************************************************************************************ */

/**
 * Window Config
 * The object containing the configuration that will be used to fetch the candlesticks and calculate
 * the state.
 */
type IWindowConfig = {
  // the candlesticks will be re-fetched every refetchFrequency seconds
  refetchFrequency: number;

  // the % change required for the window splits to be stateful (1 | -1)
  requirement: number;

  // the % change required for the window splits to have a strong state (2 | -2)
  strongRequirement: number;
};





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export type {
  // service
  IWindowService,

  // types
  IWindowConfig,
};
