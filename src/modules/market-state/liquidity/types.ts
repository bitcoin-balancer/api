

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
  state: ILiquidityState;
  config: ILiquidityConfig;

  // state calculator
  calculateState: (baseAssetPrice: number) => ICompactLiquidityState;
  getPristineState: () => ICompactLiquidityState;

  // initializer
  initialize: () => Promise<void>;
  teardown: () => Promise<void>;

  // configuration
  updateConfiguration: (newConfig: ILiquidityConfig) => Promise<void>;
};

/**
 * Order Book Service
 * Object in charge of establishing a real-time connection with the Exchange's Order Book.
 */
type IOrderBookService = {
  // properties
  lastRefetch: number;

  // retriever
  getSides: (range: ILiquidityPriceRange) => { asks: ILiquiditySide, bids: ILiquiditySide };

  // initializer
  off: () => void;
};





/* ************************************************************************************************
 *                                             TYPES                                              *
 ************************************************************************************************ */

/**
 * Liquidity Side
 * An Order Book is comprised by 2 sides. The asks (sell orders) and bids (buy orders).
 */
type ILiquiditySideID = 'asks' | 'bids';

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

/**
 * Liquidity Price Range
 * The price range that will be used to select the orders that will be factored when calculating the
 * state. Orders outside of this range are ignored.
 */
type ILiquidityPriceRange = {
  // the current price of the base asset
  current: number;

  // the upper band used to select the asks (current + maxDistanceFromPrice%)
  upper: number;

  // the lower band used to select the bids (current - maxDistanceFromPrice%)
  lower: number;
};

/**
 * Liquidity Intensity Requirements
 * For a price level to have intensity and be considered a "peak", it requires the liquidity
 * specific in this object. Otherwise, it will have an intensity of 0.
 */
type ILiquidityIntensityRequirements = {
  low: number; // 1
  medium: number; // 2
  high: number; // 3
  veryHigh: number; // 4
};

/**
 * Liquidity Price Level
 * The tuple containing the processed data for a whole price in the order book.
 */
type ILiquidityPriceLevel = [
  number, // level's price
  number, // liquidity within the level
  ILiquidityIntensity, // liquidity intensity
];

/**
 * Liquidity Side
 * The object containing the order book's processed data for a side.
 */
type ILiquiditySide = {
  // the total liquidity accumulated in all levels
  total: number;

  // the list of price levels that comprise the side
  levels: ILiquidityPriceLevel[];
};





/* ************************************************************************************************
 *                                             STATE                                              *
 ************************************************************************************************ */

/**
 * Liquidity State
 * The object containing the full liquidity state as well as the payload.
 */
type ILiquidityState = {
  // the price range used to select the orders that will factor into the state's calculation
  priceRange: ILiquidityPriceRange;

  // the liquidity intensity requirements used to calculate the intensity of price levels
  intensityRequirements: ILiquidityIntensityRequirements;

  // the object containing all the price levels for a side including the liquidity total
  asks: ILiquiditySide;
  bids: ILiquiditySide;

  // the percentage representation of the bid dominance (buy orders against sell orders)
  bidDominance: number;

  // the last time the order book snapshot was fetched from the Exchange's API
  lastRefetch: number;
};

/**
 * Compact Liquidity State
 * The object containing a very compact variant of the full state.
 */
type ICompactLiquidityState = {
  bidDominance: number;
};





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
  IOrderBookService,

  // types
  ILiquiditySideID,
  ILiquidityIntensity,
  ILiquidityIntensityWeights,
  ILiquidityPriceRange,
  ILiquidityIntensityRequirements,
  ILiquidityPriceLevel,
  ILiquiditySide,

  // state
  ILiquidityState,
  ICompactLiquidityState,

  // configuration
  ILiquidityConfig,
};
