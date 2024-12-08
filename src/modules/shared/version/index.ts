/* eslint-disable no-console */
import ms from 'ms';
import { encodeError } from 'error-message-utils';
import {
  isArrayValid,
  isObjectValid,
  isStringValid,
  isSemverValid,
  delay,
  retryAsyncFunction,
} from 'web-utils-kit';
import { sendGET } from 'fetch-request-node';
import { APIErrorService } from '../../api-error/index.js';
import {
  IVersionService,
  IServiceVersionURLs,
  IDataSourceURLs,
  IVersion,
  IServiceVersion,
} from './types.js';

/* ************************************************************************************************
 *                                         IMPLEMENTATION                                         *
 ************************************************************************************************ */

/**
 * Version Service Factory
 * Generates the Object in charge of keeping track of the running and latest distributed versions.
 * @returns IVersionService
 */
const versionServiceFactory = (): IVersionService => {
  /* **********************************************************************************************
   *                                          PROPERTIES                                          *
   ********************************************************************************************** */

  // the main object version that will be kept in sync with GitHub
  let __version: IVersion;

  // the links used to extract service's version data from GitHub
  const __URLS: IDataSourceURLs = {
    gui: {
      packageFile: 'https://raw.githubusercontent.com/bitcoin-balancer/gui/main/package.json',
      commits: 'https://api.github.com/repos/bitcoin-balancer/gui/commits',
    },
    api: {
      packageFile: 'https://raw.githubusercontent.com/bitcoin-balancer/api/main/package.json',
      commits: 'https://api.github.com/repos/bitcoin-balancer/api/commits',
    },
  };

  // the number of seconds that will be awaited between requests
  const __REQUEST_DELAY = 2;

  // the latest versions will be re-fetched every __REFETCH_FREQUENCY hours
  const __REFETCH_FREQUENCY: number = 6;
  let __refetchInterval: NodeJS.Timeout;





  /* **********************************************************************************************
   *                                          RETRIEVERS                                          *
   ********************************************************************************************** */

  /**
   * Retrieves the package.json file for a service, validates and returns the version.
   * @param url
   * @returns Promise<string>
   */
  const __getLatestServiceVersion = async (url: string): Promise<string> => {
    const { data } = await sendGET(url, {
      requestOptions: {
        headers: new Headers({ Accept: 'text/plain' }),
      },
    });
    if (!isObjectValid(data) || !isSemverValid(data.version)) {
      throw new Error(encodeError(`The package.json file retrieved from ${url} does not contain a valid version.`, 7000));
    }
    return data.version;
  };

  /**
   * Retrieves the list of a commits for a given service and retrieves the latest sha-1 hash and the
   * date it was committed.
   * @param url
   * @returns Promise<{ sha: string, eventTime: number }>
   */
  const __getLatestServiceCommit = async (
    url: string,
  ): Promise<{ sha: string, eventTime: number }> => {
    const { data } = await sendGET(url);
    if (
      !isArrayValid(data)
      || !isObjectValid(data[0])
      || !isStringValid(data[0].sha)
      || !isObjectValid(data[0].commit)
      || !isObjectValid(data[0].commit.committer)
      || !isStringValid(data[0].commit.committer.date)
    ) {
      console.log(data);
      throw new Error(encodeError(`The list of commits retrieved from ${url} are invalid.`, 7001));
    }
    return { sha: data[0].sha, eventTime: new Date(data[0].commit.committer.date).getTime() };
  };

  /**
   * Retrieves the version build for a given service.
   * @param urls
   * @returns Promise<IServiceVersion>
   */
  const __getServiceVersion = async (urls: IServiceVersionURLs): Promise<IServiceVersion> => {
    const [version, { sha, eventTime }] = await Promise.all([
      __getLatestServiceVersion(urls.packageFile),
      __getLatestServiceCommit(urls.commits),
    ]);
    return { version, sha, eventTime };
  };





  /* **********************************************************************************************
   *                                            BUILDER                                           *
   ********************************************************************************************** */

  /**
   * Builds the version object for all the services that comprise Balancer. If runningVersion is
   * provided, it will initialize the object. Subsequent invocations will only update the dynamic
   * properties.
   * @param runningVersion?
   * @returns Promise<void>
   */
  const __buildVersion = async (runningVersion?: string): Promise<void> => {
    // retrieve the service versions
    const gui = await retryAsyncFunction(__getServiceVersion, [__URLS.gui], [3, 5, 10]);
    await delay(__REQUEST_DELAY);
    const api = await retryAsyncFunction(__getServiceVersion, [__URLS.api], [3, 5, 10]);

    // if the module has not been init, set the version object. Otherwise, just update the services
    if (runningVersion) {
      __version = {
        gui: {
          latest: gui,
        },
        api: {
          latest: api,
          running: runningVersion,
        },
        refetchTime: Date.now(),
      };
    } else {
      __version.gui.latest = gui;
      __version.api.latest = api;
      __version.refetchTime = Date.now();
    }
  };




  /* **********************************************************************************************
   *                                          INITIALIZER                                         *
   ********************************************************************************************** */

  /**
   * Initializes the Notification Module if the configuration was provided.
   * @param runningVersion
   * @returns Promise<void>
   */
  const initialize = async (runningVersion: string): Promise<void> => {
    // initialize the version build
    await __buildVersion(runningVersion);

    // initialize the refresh interval
    __refetchInterval = setInterval(async () => {
      try {
        await __buildVersion();
      } catch (e) {
        APIErrorService.save('VersionService.initialize.__buildVersion', e);
      }
    }, ms(`${__REFETCH_FREQUENCY} hours`));
  };

  /**
   * Tears down the Version Module if it was initialized.
   * @returns Promise<void>
   */
  const teardown = async (): Promise<void> => {
    if (__refetchInterval) {
      clearInterval(__refetchInterval);
    }
  };





  /* **********************************************************************************************
   *                                         MODULE BUILD                                         *
   ********************************************************************************************** */
  return Object.freeze({
    // properties
    get version() {
      return __version;
    },

    // initializer
    initialize,
    teardown,
  });
};





/* ************************************************************************************************
 *                                        GLOBAL INSTANCE                                         *
 ************************************************************************************************ */
const VersionService = versionServiceFactory();





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  // service
  VersionService,

  // types
  type IVersion,
};
