
/* ************************************************************************************************
 *                                            SERVICE                                             *
 ************************************************************************************************ */

/**
 * Candlestick Service
 * Object in charge of managing candlesticks in general as well as events' histories.
 */
type ICandlestickService = {
  // properties
  // ...

  // retrievers
  getEventHistory: (id: string) => Promise<IEventHistoryRecord>;
};





/* ************************************************************************************************
 *                                            FACTORY                                             *
 ************************************************************************************************ */

/**
 * Event History
 * Object in charge of creating and storing data in OHLC format.
 */
type IEventHistory = {
  // properties
  // ...

  // event handler
  handleNewData: (data: number[]) => void;

  // initializer
  complete: () => Promise<void>;
};





/* ************************************************************************************************
 *                                             TYPES                                              *
 ************************************************************************************************ */

/**
 * Candlestick Interval ID
 * The identifier of the interval that will be used to build the candlesticks.
 */
type ICandlestickIntervalID =
'1m' | '3m' | '5m' | '15m' | '30m' | // minutes
'1h' | '2h' | '4h' | '6h' | '8h' | '12h' | // hours
'1d'; // days

/**
 * Event Name
 * The name of the event which history is being tracked and stored.
 */
type IEventName = 'reversal' | 'position';

/**
 * Candlestick Record
 * The Kline object containing historical values in OHLC format.
 */
type ICandlestickRecord = {
  // open time (ms) - e.g. 1638122400000
  id: number;

  // open value - e.g. 53896.36
  open: number;

  // high value - e.g. 54186.17
  high: number;

  // low value - e.g. 53256.64
  low: number;

  // close value - e.g. 54108.99
  close: number;
};

/**
 * Compact Candlestick Records
 * The object containing a compact representation of a series of candlesticks.
 */
type ICompactCandlestickRecords = {
  id: number[];
  open: number[];
  high: number[];
  low: number[];
  close: number[];
};

/**
 * Combined Compact Candlestick Records
 * The object containing the compact candlestick records for multiple data items dependending on the
 * event.
 */
type ICombinedCompactCandlestickRecords = {
  id: number[];
  open: Array<number[]>;
  high: Array<number[]>;
  low: Array<number[]>;
  close: Array<number[]>;
};

/**
 * Event History Record
 * The object containing the event settings as well as the candlesticks.
 */
type IEventHistoryRecord = {
  // the unique identifier of the event
  id: string;

  // the name of the event being tracked and stored
  event: IEventName;

  // the interval used to build the candlesticks for the event
  interval: ICandlestickIntervalID;

  // the candlestick records for all the data items managed by the event
  records: ICombinedCompactCandlestickRecords;

  // the timestamp (in ms) when the event first started
  event_time: number;
};





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export type {
  // service
  ICandlestickService,

  // factory
  IEventHistory,

  // types
  ICandlestickIntervalID,
  IEventName,
  ICandlestickRecord,
  ICompactCandlestickRecords,
  ICombinedCompactCandlestickRecords,
  IEventHistoryRecord,
};
