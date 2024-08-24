import { Buffer } from 'node:buffer';
import { WebSocket } from 'ws';
import { extractMessage } from 'error-message-utils';
import { delay } from '../utils/index.js';
import { APIErrorService } from '../../api-error/index.js';
import { NotificationService } from '../../notification/index.js';
import { formatConnectionClosePayload, exceededIdleLimit } from './utils.js';
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
  onMessage: (value: T) => any,
  onOpen?: (ws: WebSocket) => any,
  onError?: (error: Error) => any,
  onClose?: () => any,
): IWebSocket<T> => {
  /* **********************************************************************************************
   *                                          PROPERTIES                                          *
   ********************************************************************************************** */

  // the store's identifier
  const __id: IWebSocketID = websocketID;

  // websocket instance
  let __ws: WebSocket | undefined;

  // the number of seconds the instance will wait before trying to reconnect
  const __RESTART_DELAY = 15;

  // health check system
  const __HEALTH_CHECK_FREQUENCY = 45; // seconds
  const __IDLE_LIMIT = 60; // seconds
  let __lastMessage: number;





  /* **********************************************************************************************
   *                                          CONNECTION                                          *
   ********************************************************************************************** */

  /**
   * Disconnects and destroys the websocket connection.
   */
  const off = (): void => {
    __ws?.terminate();
    __ws = undefined;
  };

  /**
   * Initializes the connection with the data origin server.
   */
  const __on = (): void => {
    // instantiate the websocket
    __ws = new WebSocket(streamURL);

    // fires whenever an error is thrown
    __ws.on('error', (e: Error) => {
      const msg = extractMessage(e);
      NotificationService.websocketError(__id, msg);
      APIErrorService.save(`WebSocket.${__id}.error`, msg);
      if (onError) {
        onError(e);
      }
    });

    // fires whenever the connection is closed by the data origin server
    __ws.on('close', async (code: number, reason: Buffer) => {
      const payload = formatConnectionClosePayload(code, reason);
      NotificationService.websocketError(__id, `The connection has been closed by the origin server. ${payload}`);
      APIErrorService.save(`WebSocket.${__id}.close`, payload);

      // attempt to reconnect
      off();
      await delay(__RESTART_DELAY);
      __on();

      // broadcast the event
      if (onClose) {
        onClose();
      }
    });

    // fires when the connection is first established
    __ws.on('open', () => {
      if (onOpen) {
        onOpen(<WebSocket>__ws);
      }
    });

    // fires when new data is broadcasted from the origin
    __ws.on('message', (data: Buffer) => {
      __lastMessage = Date.now();
      onMessage(JSON.parse(data.toString()));
    });
  };





  /* **********************************************************************************************
   *                                         HEALTH CHECK                                         *
   ********************************************************************************************** */

  /**
   * Initializes an interval that will check the state of the connection every
   * __HEALTH_CHECK_FREQUENCY seconds. If there is an issue with the connection, it will notify
   * users and try to repair it.
   */
  setInterval(async () => {
    if (__ws && exceededIdleLimit(__lastMessage, __IDLE_LIMIT)) {
      NotificationService.websocketConnectionIssue(__id);
      off();
      await delay(__RESTART_DELAY);
      __on();
    }
  }, __HEALTH_CHECK_FREQUENCY * 1000);





  /* **********************************************************************************************
   *                                         MODULE BUILD                                         *
   ********************************************************************************************** */
  __on();
  return Object.freeze({
    // properties
    get id() {
      return __id;
    },

    // connection management
    off,
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
