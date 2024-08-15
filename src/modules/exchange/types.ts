

/* ************************************************************************************************
 *                                            SERVICE                                             *
 ************************************************************************************************ */

/**
 * Exchange Service
 * Object in charge of brokering the communication with the Exchanges' APIs.
 */
type IExchangeService = {
  // properties
  // ...

  // initializer
  initialize: () => Promise<void>;
  teardown: () => Promise<void>;
};





/* ************************************************************************************************
 *                                          CANDLESTICK                                           *
 ************************************************************************************************ */

/**
 * Candlestick Interval
 * The duration of each candlestick period (supported by all exchanges).
 */
type ICandlestickInterval =
'1m' | '5m' | '15m' | '30m' | // minutes
'1h' | // hours
'1d' | // days
'1w'; // weeks





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export type {
  // service
  IExchangeService,

  // candlestick
  ICandlestickInterval,
};
