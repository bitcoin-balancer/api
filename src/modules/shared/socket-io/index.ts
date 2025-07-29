/* eslint-disable no-console */
import { Server, Socket, ServerOptions } from 'socket.io';
import { encodeError } from 'error-message-utils';
import { IHTTPServer } from '../types.js';
import { ENVIRONMENT } from '../environment/index.js';
import { JWTService } from '../../auth/jwt/index.js';
import type { ICompactAppEssentials } from '../../data-join/index.js';
import { extractRefreshJWT, shouldDisconnect } from './utils.js';
import {
  ISocketIOService,
  IEventName,
  IServerToClientEvents,
  IClientToServerEvents,
  IInterServerEvents,
  ISocketData,
} from './types.js';

/* ************************************************************************************************
 *                                         IMPLEMENTATION                                         *
 ************************************************************************************************ */

/**
 * Socket IO Service Factory
 * Generates the object in charge of exposing a Socket.IO instance to all of Balancer's modules.
 * @returns ISocketIOService
 */
const socketIOServiceFactory = (): ISocketIOService => {
  /* **********************************************************************************************
   *                                          PROPERTIES                                          *
   ********************************************************************************************** */

  // the config that will be used to instantiate the server
  const __SERVER_OPTIONS: Partial<ServerOptions> = {
    path: '/stream/',
    cors: {
      origin: [ENVIRONMENT.GUI_URL],
      credentials: true,
    },
  };

  // the instance of the server
  let __io: Server;

  /* **********************************************************************************************
   *                                        EVENT EMITTERS                                        *
   ********************************************************************************************** */

  /**
   * Emits an event with optional payload.
   * @param name
   * @param payload?
   * @throws
   * - 9000: if the event cannot be emitted for any reason
   */
  const __emit = (name: IEventName, payload?: any): void => {
    const emitted = __io.emit(name, payload);
    if (!emitted) {
      throw new Error(encodeError(`The event ${name} could not be emitted.`, 9000));
    }
  };

  /**
   * Emits the up-to-date state of the compact app essentials.
   * @param payload
   * @throws
   * - 9000: if the event cannot be emitted for any reason
   */
  const emitCompactAppEssentials = (payload: ICompactAppEssentials): void =>
    __emit('compact_app_essentials', payload);

  /* **********************************************************************************************
   *                                          MIDDLEWARES                                         *
   ********************************************************************************************** */

  /**
   * Ensures only authenticated users can proceed and establish a connection. In order to do so,
   * it extracts the Refresh JWT from the credentials cookie and verifies it. If an error is thrown,
   * it means the user is not authenticated or the Refresh JWT expired.
   * @param socket
   * @param next
   * @returns Promise<void>
   * @throws
   * - 9250: if the auth cookie was not included in the headers
   * - 9251: if the signed refresh JWT could not be extracted from the cookie
   * - 4252: if the lib fails to verify the JWT for any reason (most likely, the token expired)
   * - 4253: if the decoded data is an invalid object or does not contain the uid
   */
  const __authMiddleware = async (socket: Socket, next: (err?: Error) => void): Promise<void> => {
    try {
      await JWTService.verifyRefreshToken(extractRefreshJWT(socket.handshake.headers.cookie));
      return next();
    } catch (e) {
      return next(<Error>e);
    }
  };

  /* **********************************************************************************************
   *                                          INITIALIZER                                         *
   ********************************************************************************************** */

  /**
   * Initializes the Socket IO Module.
   * @returns Promise<void>
   */
  const initialize = async (server: IHTTPServer): Promise<void> => {
    // initialize the server
    __io = new Server<
      IClientToServerEvents,
      IServerToClientEvents,
      IInterServerEvents,
      ISocketData
    >(server, __SERVER_OPTIONS);

    // install the authentication middleware
    __io.use(__authMiddleware);

    // subscribe to the connections and handle errors accordingly
    __io.on('connection', (socket) => {
      socket.on('error', (e) => {
        if (shouldDisconnect(e)) {
          socket.disconnect();
        }
      });
    });
  };

  /**
   * Tears down the Socket IO Module.
   * IMPORTANT: when __io.close() is invoked, it also closes the underlying HTTP server.
   * @returns Promise<void>
   */
  const teardown = async (): Promise<void> => {
    if (__io) {
      __io.close();
    }
  };

  /* **********************************************************************************************
   *                                         MODULE BUILD                                         *
   ********************************************************************************************** */
  return Object.freeze({
    // properties
    // ...

    // event emitters
    emitCompactAppEssentials,

    // initializer
    initialize,
    teardown,
  });
};

/* ************************************************************************************************
 *                                        GLOBAL INSTANCE                                         *
 ************************************************************************************************ */
const SocketIOService = socketIOServiceFactory();

/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export { SocketIOService };
