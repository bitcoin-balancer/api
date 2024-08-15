import { buildPristineCompactCandlestickRecords } from './utils.js';
import { ICandlestick, ICandlestickRecord, ICompactCandlestickRecords } from './types.js';

/* ************************************************************************************************
 *                                         IMPLEMENTATION                                         *
 ************************************************************************************************ */

/**
 * Candlestick Factory
 * Generates the object in charge of creating and storing data in OHLC format.
 * @returns ICandlestick
 */
const candlestickFactory = (): ICandlestick => {
  /* **********************************************************************************************
   *                                          PROPERTIES                                          *
   ********************************************************************************************** */

  // ...





  /* **********************************************************************************************
   *                                            ACTIONS                                           *
   ********************************************************************************************** */

  const someAction = () => {
    // ...
  };




  /* **********************************************************************************************
   *                                         MODULE BUILD                                         *
   ********************************************************************************************** */
  return Object.freeze({
    // properties
    // ...

    // actions
    someAction,
  });
};





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  // factory
  candlestickFactory,

  // utilities
  buildPristineCompactCandlestickRecords,

  // types
  ICandlestickRecord,
  ICompactCandlestickRecords,
};
