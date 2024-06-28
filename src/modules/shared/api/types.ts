import { Server, IncomingMessage, ServerResponse } from 'http';
import { Express } from 'express';
import { z } from 'zod';

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
const PackageFileSchema = z.object({
  name: z.string(),
  description: z.string(),
  private: z.boolean(),
  version: z.string(),
  type: z.string(),
  main: z.string(),
  scripts: z.record(z.string(), z.string()),
  repository: z.record(z.string(), z.string()),
  keywords: z.array(z.string()),
  author: z.string(),
  license: z.string(),
  bugs: z.record(z.string(), z.string()),
  homepage: z.string(),
  devDependencies: z.record(z.string(), z.string()),
  dependencies: z.record(z.string(), z.string()),
});
type IPackageFile = z.infer<typeof PackageFileSchema>;

/**
 * API
 * The API Module that is instantiated on start up and is in charge of managing the
 * initialization and teardown of API modules as well as the Node.js HTTP Server.
 */
type IAPI = {
  // properties
  server: IHTTPServer;
  initialized: boolean,
  packageFile: IPackageFile,

  // initialization
  initialize: (app: Express, retryDelaySchedule?: number[]) => Promise<void>,
};





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  // types
  type IHTTPServer,
  type ITerminationSignal,
  type IPackageFile,
  type IAPI,

  // schemas
  PackageFileSchema,
};
