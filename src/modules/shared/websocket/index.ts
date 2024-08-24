import { WebSocket } from 'ws';
import { Subject, Observer, Subscription } from 'rxjs';
import { IWebSocketFactory, IWebSocketID, IWebSocket } from './types.js';

/* ************************************************************************************************
 *                                         IMPLEMENTATION                                         *
 ************************************************************************************************ */

/**
 * WebSocket Factory
 * Generates the object in charge of connecting to external streams and managing the connectons.
 * @param websocketID
 * @param streamURL
 * @returns IWebSocket<T>
 */
const websocketFactory: IWebSocketFactory = <T>(
  websocketID: IWebSocketID,
  streamURL: string,
): IWebSocket<T> => {
  /* **********************************************************************************************
   *                                          PROPERTIES                                          *
   ********************************************************************************************** */

  // the store's identifier
  const __id: IWebSocketID = websocketID;

  // the multicast observable containing the stream
  const __stream = new Subject<T>();

  // health check system
  const __HEALTH_CHECK_FREQUENCY = 30;
  let __healthCheckInterval: NodeJS.Timeout;
  let __lastMessage: number;

  // websocket instance
  let __ws: WebSocket;





  /* **********************************************************************************************
   *                                     CONNECTION MANAGEMENT                                    *
   ********************************************************************************************** */

  /**
   * Retrieves an instance of a subscription to the stream.
   * @returns (obs?: Partial<Observer<T>> | ((value: T) => void)) => Subscription
   */
  const subscribe = (): (obs?: Partial<Observer<T>> | ((value: T) => void)) => Subscription => (
    __stream.subscribe
  );

  /**
   * Disconnects and destroys the websocket connection.
   */
  const unsubscribe = (streamSubscription: Subscription | undefined): void => {
    streamSubscription?.unsubscribe();
    clearInterval(__healthCheckInterval);
    // ..
  };





  /* **********************************************************************************************
   *                                         MODULE BUILD                                         *
   ********************************************************************************************** */
  return Object.freeze({
    // properties
    get id() {
      return __id;
    },

    // connection management
    subscribe,
    unsubscribe,
  });
};





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  // factory
  websocketFactory,

  // types
  type IWebSocket,
};
