import { buildPristineCompactCandlestickRecords } from './utils.js';
import {
  ICandlestick,
  ICandlestickIntervalID,
  ICandlestickRecord,
  ICompactCandlestickRecords,
  IEventName,
} from './types.js';

/* ************************************************************************************************
 *                                         IMPLEMENTATION                                         *
 ************************************************************************************************ */

/**
 * Candlestick Factory
 * Generates the object in charge of creating and storing historic data in OHLC format.
 * @returns Promise<ICandlestick>
 */
const candlestickFactory = async (
  id: string,
  event: IEventName,
  interval: ICandlestickIntervalID,
): Promise<ICandlestick> => {
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
