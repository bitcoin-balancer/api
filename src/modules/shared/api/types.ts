import { Server, IncomingMessage, ServerResponse } from 'http';
import { Express } from 'express';

/* ************************************************************************************************
 *                                            SERVICE                                             *
 ************************************************************************************************ */

/**
 * API Service
 * This object is instantiated on start up and is in charge of managing the initialization and
 * teardown of API modules as well as the Node.js HTTP Server.
 */
type IAPIService = {
  // properties
  server: IHTTPServer;
  initialized: boolean,
  packageFile: IPackageFile,

  // initialization
  initialize: (app: Express, retryDelaySchedule?: number[]) => Promise<void>,
};





/* ************************************************************************************************
 *                                             TYPES                                              *
 ************************************************************************************************ */

/**
 * HTTP Server
 * The instanec of a Node.js HTTP Server.
 */
type IHTTPServer = Server<typeof IncomingMessage, typeof ServerResponse>;

/**
 * Termination Signal
 * The signal that is emitted once the process is being shutdown.
 */
type ITerminationSignal = 'SIGINT' | 'SIGTERM';

/**
 * Package File
 * When the API is initialized, it loads the package.json file and keeps its contents in memory.
 */
type IPackageFile = {
  name: string;
  description: string;
  private: boolean;
  version: string;
  type: string;
  main: string;
  scripts: { [key: string]: string };
  repository: { [key: string]: string };
  keywords: string[];
  author: string;
  license: string;
  bugs: { [key: string]: string };
  homepage: string;
  devDependencies: { [key: string]: string };
  dependencies: { [key: string]: string };
};





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export type {
  // service
  IAPIService,

  // types
  IHTTPServer,
  ITerminationSignal,
  IPackageFile,
};
