/* eslint-disable no-console */
import { extractMessage } from 'error-message-utils';
import { sendPOST } from 'fetch-request-node';
import { ENVIRONMENT, ITelegramConfig } from '../shared/environment/index.js';
import { invokeFuncPersistently } from '../shared/utils/index.js';
import { APIErrorService } from '../api-error/index.js';
import { buildRequestInput, toMessage } from './utils.js';
import { INotificationService, INotification } from './types.js';

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

  // since Telegram's integration is optional, if the values aren't valid, msgs aren't broadcasted
  const __CONFIG: ITelegramConfig | undefined = (
    ENVIRONMENT.TELEGRAM.token.length > 0 && ENVIRONMENT.TELEGRAM.chatID !== 0
      ? ENVIRONMENT.TELEGRAM
      : undefined
  );

  // notifications are broadcasted in a queue because modules like APIErrors can spam messages
  const __queue: INotification[] = [];
  const __queueLimit: number = 7;
  const __broadcastFrequencySeconds: number = 10;
  let __broadcastInterval: NodeJS.Timeout;





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
  const broadcast = async (notification: INotification): Promise<void> => {
    if (__CONFIG) {
      try {
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
  const __addToQueue = (notification: INotification): void => {
    if (__CONFIG && __queue.length < __queueLimit) {
      __queue.push(notification);
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
    title: 'API Initialized',
    description: 'The API has been initialized successfully and is ready to accept requests.',
  });

  /**
   * Broadcasts a message notifying users the API failed to initialize.
   * @param error
   * @returns Promise<void>
   */
  const apiInitError = (error: any): Promise<void> => broadcast({
    sender: 'API_INITIALIZER',
    title: 'API Initialization Failed',
    description: extractMessage(error),
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
    title: 'High CPU Load!',
    description: `The CPU’s load is currently at ${current}% which exceeds the limit of ${limit}%.`,
  });

  /**
   * Broadcasts a message notifying users the RAM is overused.
   * @param current
   * @param limit
   */
  const highMemoryUsage = (current: number, limit: number): void => __addToQueue({
    sender: 'SERVER',
    title: 'High Memory Usage!',
    description: `The Virtual Memory's usage is currently at ${current}% which exceeds the limit of ${limit}%.`,
  });

  /**
   * Broadcasts a message notifying users the File System is overused.
   * @param current
   * @param limit
   */
  const highFileSystemUsage = (current: number, limit: number): void => __addToQueue({
    sender: 'SERVER',
    title: 'High File System Usage!',
    description: `The File System's usage is currently at ${current}% which exceeds the limit of ${limit}%.`,
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
    // ...

    // broadcaster
    broadcast,

    // api initializer
    apiInit,
    apiInitError,

    // server alarms
    highCPULoad,
    highMemoryUsage,
    highFileSystemUsage,

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
  NotificationService,
};
