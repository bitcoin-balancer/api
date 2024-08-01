

/* ************************************************************************************************
 *                                            SERVICE                                             *
 ************************************************************************************************ */

/**
 * Version Service
 * Object in charge of keeping track of the running and latest distributed versions.
 */
type IVersionService = {
  // properties
  version: IVersion;

  // initializer
  initialize: (runningVersion: string) => Promise<void>;
  teardown: () => Promise<void>;
};





/* ************************************************************************************************
 *                                             TYPES                                              *
 ************************************************************************************************ */

/**
 * Data Source URLs
 * The object containing the URLs required to extract all of the neccessary data for the module.
 */
type IServiceVersionURLs = {
  packageFile: string;
  commits: string;
};
type IDataSourceURLs = {
  gui: IServiceVersionURLs;
  api: IServiceVersionURLs;
};

/**
 * Commit Record
 * The commit object provided by GitHub's API. To view the whole object visit:
 * https://api.github.com/repos/bitcoin-balancer/api/commits
 */
type ICommitRecord = {
  sha: string; // <- the commit's hash (e.g. '8adf8f195b7d0f06eabdd8b7e08a5c050273811b')
  node_id: string;
  commit: {
    author: object;
    committer: {
      name: string;
      email: string;
      date: string; // <- the commit's date (e.g. '2024-06-22T16:32:33Z')
    };
    message: string;
    tree: object;
    url: string;
    comment_count: number;
    verification: object
  };
  url: string;
  html_url: string;
  comments_url: string;
  author: object;
  committer: object;
  parents: object[];
};

/**
 * Service Version
 * The information regarding the current version of a service (gui | api).
 */
type IServiceVersion = {
  // the version extracted from the package.json file
  version: string;

  // the commit's SHA-1 hash
  sha: string;

  // the timestamp in ms when the commit was deployed
  eventTime: number;
};

/**
 * Version
 * The versions for the services that comprise Balancer.
 */
type IVersion = {
  // the app's version (front-end)
  gui: {
    // the latest distributed version
    latest: IServiceVersion;

    // ...
  };

  // the server's version (back-end)
  api: {
    // the latest distributed version
    latest: IServiceVersion;

    // the version that is currently running
    running: string;
  };

  // the timestamp in ms of the last time the version was refreshed
  refreshTime: number;
};





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export type {
  // service
  IVersionService,

  // types
  IServiceVersionURLs,
  IDataSourceURLs,
  ICommitRecord,
  IServiceVersion,
  IVersion,
};
