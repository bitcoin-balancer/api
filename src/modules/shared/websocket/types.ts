import { WebSocket } from 'ws';

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
  onMessage: (value: T) => any,
  onOpen?: (ws: WebSocket) => any,
  onError?: (error: Error) => any,
  onClose?: () => any,
) => IWebSocket<T>;

/**
 * WebSocket
 * Object in charge of connecting to external streams and managing the connectons.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type IWebSocket<T> = {
  // properties
  id: IWebSocketID;

  // connection management
  off: () => void;
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
