/* eslint-disable no-console */
import { extractMessage } from 'error-message-utils';
import { sendPOST } from 'fetch-request-node';
import { ENVIRONMENT, ITelegramConfig } from '../shared/environment/index.js';
import { invokeFuncPersistently } from '../shared/utils/index.js';
import { APIErrorService } from '../api-error/index.js';
import { buildRequestInput, toMessage, prettifyDollarValue } from './utils.js';
import { canRecordsBeListed } from './validations.js';
import { listRecords, saveRecord } from './model.js';
import { throttleableNotificationFactory } from './throttleable-notification.js';
import { INotificationService, INotification, IPreSaveNotification } from './types.js';

/* ************************************************************************************************
 *                                         IMPLEMENTATION                                         *
 ************************************************************************************************ */

/**
 * Notification Service Factory
 * Generates the object in charge of broadcasting notifications through the Telegram Group.
 * @returns INotificationService
 */
const notificationServiceFactory = (): INotificationService => {
  /* **********************************************************************************************
   *                                          PROPERTIES                                          *
   ********************************************************************************************** */

  // the number of notifications that have not been read by the users
  let __unreadCount: number = 0;

  // since Telegram's integration is optional, if the values aren't valid, msgs aren't broadcasted
  const __CONFIG: ITelegramConfig | undefined = (
    ENVIRONMENT.TELEGRAM.token.length > 0 && ENVIRONMENT.TELEGRAM.chatID !== 0
      ? ENVIRONMENT.TELEGRAM
      : undefined
  );

  // notifications are broadcasted in a queue because modules like APIErrors can spam messages
  const __queue: IPreSaveNotification[] = [];
  const __queueLimit: number = 7;
  const __broadcastFrequencySeconds: number = 10;
  let __broadcastInterval: NodeJS.Timeout;





  /* **********************************************************************************************
   *                                           RETRIEVERS                                         *
   ********************************************************************************************** */

  /**
   * Retrieves a series of records. If the startAtID is provided, it will start at that point
   * exclusively.
   * @param limit
   * @param startAtID
   * @returns Promise<INotification[]>
   * @throws
   * - 10500: if the startAtID was provided and is not a valid identifier
   * - 10501: if the query limit is larger than the limit
   */
  const list = async (limit: number, startAtID: number | undefined): Promise<INotification[]> => {
    canRecordsBeListed(limit, startAtID);
    const records = await listRecords(limit, startAtID);
    __unreadCount = 0;
    return records;
  };





  /* **********************************************************************************************
   *                                          BROADCASTER                                         *
   ********************************************************************************************** */

  /**
   * Attempts to broadcast a message persistently. Keep in mind this is a safe function to invoke.
   * In case all the attempts fail, the error is saved in by the APIError Module and the promise is
   * resolved.
   * @param notification
   * @returns Promise<void>
   */
  const broadcast = async (notification: IPreSaveNotification): Promise<void> => {
    if (__CONFIG) {
      try {
        await saveRecord(
          notification.sender,
          notification.title,
          notification.description,
          notification.event_time,
        );
        __unreadCount += 1;
        await invokeFuncPersistently(
          sendPOST,
          [buildRequestInput(__CONFIG.token, __CONFIG.chatID, toMessage(notification))],
          [3, 5],
        );
      } catch (e) {
        console.error('Notification.broadcast(...)', e);
        APIErrorService.save('Notification.broadcast', e, undefined, undefined, notification);
      }
    }
  };

  /**
   * Adds a notification to the queue if Telegram has been integrated.
   * @param notification
   */
  const __addToQueue = (notification: Omit<IPreSaveNotification, 'event_time'>): void => {
    if (__CONFIG && __queue.length < __queueLimit) {
      __queue.push({ ...notification, event_time: Date.now() });
    }
  };





  /* **********************************************************************************************
   *                                        API INITIALIZER                                       *
   ********************************************************************************************** */

  /**
   * Broadcasts a message notifying users the API has been successfully initialized.
   */
  const apiInit = (): void => __addToQueue({
    sender: 'API_INITIALIZER',
    title: 'API initialized',
    description: 'The API has been initialized successfully and is ready to accept requests.',
  });

  /**
   * Broadcasts a message notifying users the API failed to initialize.
   * @param error
   * @returns Promise<void>
   */
  const apiInitError = (error: any): Promise<void> => broadcast({
    sender: 'API_INITIALIZER',
    title: 'API initialization failed',
    description: extractMessage(error),
    event_time: Date.now(),
  });





  /* **********************************************************************************************
   *                                        SERVER ALARMS                                         *
   ********************************************************************************************** */

  /**
   * Broadcasts a message notifying users the CPU is overloaded.
   * @param current
   * @param limit
   */
  const highCPULoad = (current: number, limit: number): void => __addToQueue({
    sender: 'SERVER',
    title: 'High CPU load!',
    description: `The CPU’s load is currently at ${current}% which exceeds the limit of ${limit}%.`,
  });

  /**
   * Broadcasts a message notifying users the RAM is overused.
   * @param current
   * @param limit
   */
  const highMemoryUsage = (current: number, limit: number): void => __addToQueue({
    sender: 'SERVER',
    title: 'High memory usage!',
    description: `The virtual memory's usage is currently at ${current}% which exceeds the limit of ${limit}%.`,
  });

  /**
   * Broadcasts a message notifying users the File System is overused.
   * @param current
   * @param limit
   */
  const highFileSystemUsage = (current: number, limit: number): void => __addToQueue({
    sender: 'SERVER',
    title: 'High file system usage!',
    description: `The file system's usage is currently at ${current}% which exceeds the limit of ${limit}%.`,
  });





  /* **********************************************************************************************
   *                                          WEBSOCKET                                           *
   ********************************************************************************************** */

  /**
   * Broadcasts a message notifying users there is an issue with a specific websocket.
   * @param id
   * @param error
   */
  const websocketError = (id: string, error: string): void => __addToQueue({
    sender: 'WEBSOCKET',
    title: `${id} Websocket error`,
    description: `${error} - If the data stream is not restored in a few minutes, consider restarting Balancer in order to try again.`,
  });

  /**
   * Broadcasts a message notifying users there are issues with the websocket connection.
   * @param id
   */
  const websocketConnectionIssue = (id: string): void => __addToQueue({
    sender: 'WEBSOCKET',
    title: `${id} Websocket issue`,
    description: 'The websocket has not broadcasted data in an irregular period of time. Balancer will attempt to restore the connection in a few seconds. If this issue persists, you may need to restart Balancer.',
  });





  /* **********************************************************************************************
   *                                         MARKET STATE                                         *
   ********************************************************************************************** */

  /**
   * Triggers whenever an error is thrown during the calculation of the market state.
   * @param errorMessage
   */
  const marketStateError = (errorMessage: string): void => __addToQueue({
    sender: 'MARKET_STATE',
    title: 'State calculation error',
    description: errorMessage,
  });

  /**
   * Broadcasts a message notifying users the Coins module could not be re-initialized.
   * @param error
   */
  const coinsReInitError = (error: string): void => __addToQueue({
    sender: 'MARKET_STATE',
    title: 'Error when re-initializing the Coins Module',
    description: `${error} - Please restart Balancer in order to fix the issue.`,
  });

  /**
   * Broadcasts a message notifying users the Bitcoin price is moving strongly.
   * @param price
   * @param change
   */
  const windowState = (price: number, change: number): void => __addToQueue({
    sender: 'MARKET_STATE',
    title: `Bitcoin is ${change > 0 ? 'increasing' : 'decreasing'}`,
    description: `The price has changed ${change > 0 ? '%2b' : ''}${change}% in the window and is currently at ${prettifyDollarValue(price)}`,
  });

  /**
   * Broadcasts a message notifying users a reversal event has just been issued.
   * @param points
   */
  const onReversalEvent = (points: number): void => __addToQueue({
    sender: 'MARKET_STATE',
    title: 'Reversal event',
    description: `The Reversal Module has just issued an event with a total of ${points}/100 points.`,
  });





  /* **********************************************************************************************
   *                                          INITIALIZER                                         *
   ********************************************************************************************** */

  /**
   * Initializes the Notification Module if the configuration was provided.
   * @returns Promise<void>
   */
  const initialize = async (): Promise<void> => {
    if (__CONFIG) {
      __broadcastInterval = setInterval(async () => {
        if (__queue.length) {
          await broadcast(<INotification>__queue.shift());
        }
      }, __broadcastFrequencySeconds * 1000);
    }
  };

  /**
   * Tears down the Notification Module if it was initialized.
   * @returns Promise<void>
   */
  const teardown = async (): Promise<void> => {
    clearInterval(__broadcastInterval);
  };





  /* **********************************************************************************************
   *                                         MODULE BUILD                                         *
   ********************************************************************************************** */
  return Object.freeze({
    // properties
    get unreadCount() {
      return __unreadCount;
    },

    // retrievers
    list,

    // broadcaster
    broadcast,

    // api initializer
    apiInit,
    apiInitError,

    // server alarms
    highCPULoad,
    highMemoryUsage,
    highFileSystemUsage,

    // websocket
    websocketError,
    websocketConnectionIssue,

    // market state
    marketStateError,
    coinsReInitError,
    windowState,
    onReversalEvent,

    // initializer
    initialize,
    teardown,
  });
};





/* ************************************************************************************************
 *                                        GLOBAL INSTANCE                                         *
 ************************************************************************************************ */
const NotificationService = notificationServiceFactory();





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  // service
  NotificationService,

  // factory
  throttleableNotificationFactory,
};
