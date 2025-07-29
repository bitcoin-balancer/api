import { IHTTPServer } from '../types.js';
import type { ICompactAppEssentials } from '../../data-join/index.js';

/* ************************************************************************************************
 *                                            SERVICE                                             *
 ************************************************************************************************ */

/**
 * Socket IO Service
 * Object in charge of exposing a Socket.IO instance to all of Balancer's modules.
 */
type ISocketIOService = {
  // properties
  // ...

  // event emitters
  emitCompactAppEssentials: (payload: ICompactAppEssentials) => void;

  // initializer
  initialize: (server: IHTTPServer) => Promise<void>;
  teardown: () => Promise<void>;
};

/* ************************************************************************************************
 *                                             TYPES                                              *
 ************************************************************************************************ */

/**
 * Event Name
 * Each event has a unique name that is used when emiting or listening to values.
 */
type IEventName = 'compact_app_essentials';

/**
 * Server To Client Events
 * Events that are broadcasted only from the server.
 */
type IServerToClientEvents = {
  compact_app_essentials: (payload: ICompactAppEssentials) => void;
};

/**
 * Client To Server Events
 * Events that are broadcasted only from the client.
 */
type IClientToServerEvents = {};

/**
 * Inter Server Events
 * Events that are broadcated from the server and/or the client.
 */
type IInterServerEvents = {
  ping: () => void;
};

/**
 * Socket Data
 * Metadata that can be included in a connected socket.
 */
type ISocketData = {};

/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export type {
  // service
  ISocketIOService,

  // types
  IEventName,
  IServerToClientEvents,
  IClientToServerEvents,
  IInterServerEvents,
  ISocketData,
};
