

/* ************************************************************************************************
 *                                            SERVICE                                             *
 ************************************************************************************************ */

/**
 * Coins Service
 * Object in charge of keeping Balancer in sync with the state of the top coins.
 */
type ICoinsService = {
  // properties
  config: ICoinsConfig;


  // initializer
  initialize: () => Promise<void>;
  teardown: () => Promise<void>;

  // configuration
  updateConfiguration: (newConfig: ICoinsConfig) => Promise<void>;
};





/* ************************************************************************************************
 *                                         CONFIGURATION                                          *
 ************************************************************************************************ */

/**
 * Coins Configuration
 * The object containing the configuration that will be used to build and calculate the state of the
 * top coins.
 */
type ICoinsConfig = {
  // the number of price items that comprise the window
  size: number;

  // the duration in seconds of a price item
  interval: number;

  // the % change required for the window splits to be stateful (1 | -1)
  requirement: number;

  // the % change required for the window splits to have a strong state (2 | -2)
  strongRequirement: number;

  // the list of symbols that can be selected
  whitelistedSymbols: string[];
};





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export type {
  // service
  ICoinsService,

  // configuration
  ICoinsConfig,
};
