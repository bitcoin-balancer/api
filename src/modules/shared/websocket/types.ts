import { Observer, Subscription } from 'rxjs';

/* ************************************************************************************************
 *                                            FACTORY                                             *
 ************************************************************************************************ */

/**
 * WebSocket Factory
 * Function in charge of generating WebSocket objects.
 */
type IWebSocketFactory = <T>(
  id: IWebSocketID,
  streamURL: string,
) => IWebSocket<T>;

/**
 * WebSocket
 * Object in charge of connecting to external streams and managing the connectons.
 */
type IWebSocket<T> = {
  // properties
  id: IWebSocketID;

  // connection management
  subscribe: () => (obs?: Partial<Observer<T>> | ((value: T) => void)) => Subscription;
  unsubscribe: (streamSubscription: Subscription) => void;
};



/* ************************************************************************************************
 *                                             TYPES                                              *
 ************************************************************************************************ */

/**
 * WebSocket ID
 * Each websocket has a unique identifier to esilify
 */
type IWebSocketID = 'COINS' | 'LIQUIDITY';





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export type {
  // factory
  IWebSocketFactory,
  IWebSocket,

  // types
  IWebSocketID,
};
