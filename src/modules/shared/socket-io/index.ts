/* eslint-disable no-console */
import { Server, Socket, ServerOptions } from 'socket.io';
import { IHTTPServer } from '../types.js';
import { ENVIRONMENT } from '../environment/index.js';
import { JWTService } from '../../auth/jwt/index.js';
import { extractRefreshJWT, shouldDisconnect } from './utils.js';
import { ISocketIOService } from './types.js';

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
   *                                          MIDDLEWARES                                         *
   ********************************************************************************************** */

  /**
   * Ensures only authenticated users can proceed and establish a connection.
   * @param socket
   * @param next
   * @returns Promise<void>
   * @throws
   * - 9250: if the auth cookie was not included in the headers
   * - 9251: if the signed refresh JWT could not be extracted from the cookie
   */
  const __authMiddleware = async (socket: Socket, next: (err?: Error) => void): Promise<void> => {
    try {
      const refreshJWT = extractRefreshJWT(socket.handshake.headers.cookie);
      console.log('handshake', socket.handshake);
      console.log('refreshJWT', refreshJWT);

      // const refreshJWT: string = __extractRefreshJWT(socket.handshake.headers.cookie);
      // console.log('refreshJWT', refreshJWT);
      // await JWTService.verifyAccessToken(refreshJWT);
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
    __io = new Server(server, __SERVER_OPTIONS);

    /**
     * Authentication Middleware
     * Only authenticated users can establish a connection with the stream.
     */
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
