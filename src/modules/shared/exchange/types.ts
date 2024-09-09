import { Observable } from 'rxjs';
import { IBaseAsset, IQuoteAsset } from '../environment/index.js';
import { ICompactCandlestickRecords } from '../../candlestick/index.js';

/* ************************************************************************************************
 *                                            SERVICE                                             *
 ************************************************************************************************ */

/**
 * Exchange Service
 * Object in charge of brokering the communication with the Exchanges' APIs.
 */
type IExchangeService = {
  // properties
  CANDLESTICK_INTERVALS: ICandlestickInterval[];

  // market data
  getCandlesticks: IGetCandlesticks;
  getOrderBook: IGetOrderBook;
  getOrderBookStream: IGetOrderBookStream;
  getTopSymbols: IGetTopSymbols;
  getTickersStream: IGetTickersStream;

  // account data
  getBalances: IGetBalances;
  listTrades: IListTrades;
};





/* ************************************************************************************************
 *                                            METHODS                                             *
 ************************************************************************************************ */

// getCandlesticks
type IGetCandlesticks = (
  interval: ICandlestickInterval,
  limit: number,
  startTime?: number,
) => Promise<ICompactCandlestickRecords>;

// getOrderBook
type IGetOrderBook = () => Promise<IOrderBook>;

// getOrderBookStream
type IGetOrderBookStream = () => Observable<IOrderBookWebSocketMessage>;

// getTopSymbols
type IGetTopSymbols = (whitelistedSymbols: string[], limit: number) => Promise<string[]>;

// getTickersStream
type IGetTickersStream = (topSymbols: string[]) => Observable<ITickerWebSocketMessage>;

// getBalances
type IGetBalances = () => Promise<IBalances>;

// listTrades
type IListTrades = (startAt: number) => Promise<ITrade[]>;





/* ************************************************************************************************
 *                                            GENERAL                                             *
 ************************************************************************************************ */

/**
 * Side
 * The kind of action executed by the account.
 * BUY stands for buying the base asset (e.g. USDT -> BTC)
 * SELL stands for selling the base asset (e.g. BTC -> USDT)
 */
type ISide = 'BUY' | 'SELL';





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
 *                                           ORDER BOOK                                           *
 ************************************************************************************************ */

/**
 * Order Book
 * The current state of the order book for the base asset.
 */
type IOrderBook = {
  // asks (sell orders)
  asks: Array<[
    number, // price
    number, // quantity
  ]>;

  // bids (buy orders)
  bids: Array<[
    number, // price
    number, // quantity
  ]>;

  // the identifier of the snapshot's state
  lastUpdateID: number;
};

/**
 * Order Book WebSocket Message
 * The object that is broadcasted via the order book stream. Always make sure to check
 * finalUpdateID > lastUpdateID to ensure the syncing is done correctly as the snapshot retrieved
 * from the RESTful API should be trusted over the messages received via WebSocket.
 */
type IOrderBookWebSocketMessage = {
  // asks (sell orders)
  asks: Array<[
    number, // price
    number, // quantity
  ]>;

  // bids (buy orders)
  bids: Array<[
    number, // price
    number, // quantity
  ]>;

  // the identifier of the last update in the event
  finalUpdateID: number;
};





/* ************************************************************************************************
 *                                             TICKER                                             *
 ************************************************************************************************ */

/**
 * Ticker WebSocket Message
 * The object that is broadcasted via the ticker stream and contains the price for symbols that
 * have experienced changes. e.g. { 'BTC': 61555.65, 'ETH': 2455.21 }
 */
type ITickerWebSocketMessage = Record<string, number>;





/* ************************************************************************************************
 *                                          ACCOUNT DATA                                          *
 ************************************************************************************************ */

/**
 * Balances
 * The object containing the available balance for the base and quote assets.
 */
type IBalances = {
  [K in IBaseAsset]: number;
} & {
  [K in IQuoteAsset]?: number;
} & {
  // the timestamp in ms of the last time the balances were fetched
  refetchTime: number;
};

/**
 * Trade
 * The object containing all the details for a single trade execution.
 */
type ITrade = {
  // the identifier of the trade (assigned by Balancer)
  id?: number;

  // the identifier of the trade in the exchange
  id_alt?: string | null;

  // if this property is set it means the trade was created manually through the GUI
  notes?: string | null;

  // the kind of action that was executed
  side: ISide;

  // the rate of the trade in quote asset
  price: number;

  // the total amount in base asset
  amount: number;

  // the total comission charged in base asset
  comission: number;

  // the timestamp (ms) at which the trade was executed
  event_time: number;
};





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export type {
  // service
  IExchangeService,

  // methods
  IGetCandlesticks,
  IGetOrderBook,
  IGetOrderBookStream,
  IGetTopSymbols,
  IGetTickersStream,
  IGetBalances,
  IListTrades,

  // general
  ISide,

  // candlestick
  ICandlestickInterval,

  // order book
  IOrderBook,
  IOrderBookWebSocketMessage,

  // ticker
  ITickerWebSocketMessage,

  // account data
  IBalances,
  ITrade,
};
