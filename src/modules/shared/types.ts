import { Server, IncomingMessage, ServerResponse } from 'http';

/* ************************************************************************************************
 *                                         NODE.JS TYPES                                          *
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





/* ************************************************************************************************
 *                                         UTILITY TYPES                                          *
 ************************************************************************************************ */

/**
 * Record
 * This utility type is used to replace the original 'object' type which can become difficult to
 * deal with.
 */
type IRecord<T> = {
  [key: string]: T;
};

/**
 * Package File
 * The typical structure of a package.json file.
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
  // node.js types
  IHTTPServer,
  ITerminationSignal,

  // utility types
  IRecord,
  IPackageFile,
};
