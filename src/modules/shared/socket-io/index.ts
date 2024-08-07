/* eslint-disable no-console */
import { Server } from 'socket.io';
import { decodeError } from 'error-message-utils';
import { IHTTPServer } from '../types.js';
import { JWTService } from '../../auth/jwt/index.js';
import { ISocketIOService } from './types.js';
import { ENVIRONMENT } from '../environment/index.js';

/* ************************************************************************************************
 *                                         IMPLEMENTATION                                         *
 ************************************************************************************************ */

/**
 * Socket IO Service Factory
 * Generates the object in charge of exposing a Socket.IO instance to all of Balancer's modules.
 * @returns ISomeService
 */
const socketIOServiceFactory = (): ISocketIOService => {
  /* **********************************************************************************************
   *                                          PROPERTIES                                          *
   ********************************************************************************************** */

  // ...
  let __io: Server;





  /* **********************************************************************************************
   *                                          INITIALIZER                                         *
   ********************************************************************************************** */

  /**
   * Initializes the Socket IO Module.
   * @returns Promise<void>
   */
  const initialize = async (server: IHTTPServer): Promise<void> => {
    // initialize the server
    __io = new Server(server, {
      path: '/stream/',
      cors: {
        origin: [ENVIRONMENT.GUI_URL],
        credentials: true,
      },
    });

    /**
     * Authentication Middleware
     * Only authenticated users can establish a connection with the stream.
     */
    __io.use(async (socket, next) => {
      try {
        console.log('handshake', socket.handshake);
        await JWTService.verifyAccessToken('');
        return next();
      } catch (e) {
        return next(<Error>e);
      }
    });

    // subscribe to the connections
    __io.on('connection', (socket) => {
      /**
       * Disconnect the client if unauthenticated or unauthorized.
       * - 4252: if the lib fails to verify the JWT for any reason (most likely, the token expired)
       * - 4253: if the decoded data is an invalid object or does not contain the uid
       */
      socket.on('error', (e) => {
        const { code } = decodeError(e);
        if (code === 4252 || code === 4253) {
          socket.disconnect();
        }
      });
    });
  };

  /**
   * Tears down the Socket IO Module.
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
export {
  SocketIOService,
};
