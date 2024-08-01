import { extractMessage } from 'error-message-utils';
import { sendPOST } from 'fetch-request-node';
import { ENVIRONMENT, ITelegramConfig } from '../environment/index.js';
import { delay } from '../utils/index.js';
import { APIErrorService } from '../../api-error/index.js';
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
   * If Telegram has been integrated, it attempts to broadcast a message.
   * @param notification
   * @returns Promise<void>
   */
  const __executeBroadcast = async (notification: INotification): Promise<void> => {
    if (__CONFIG) {
      await sendPOST(buildRequestInput(
        __CONFIG.token,
        __CONFIG.chatID,
        toMessage(notification),
      ));
    }
  };

  /**
   * Attempts to broadcast a message persistently. Keep in mind this is a safe function to invoke.
   * In case all the attempts fail, the error is saved in by the APIError Module and the promise is
   * resolved.
   * @param notification
   * @param retryDelaySchedule
   * @returns Promise<void>
   */
  const broadcast = async (
    notification: INotification,
    retryDelaySchedule: number[] = [3, 5],
  ): Promise<void> => {
    // attempt to broadcast the message
    try {
      return await __executeBroadcast(notification);
    } catch (e) {
      console.error('Notification.broadcast(...)', e);

      // stop the execution if there are no attempts left. Otherwise, try again
      if (retryDelaySchedule.length === 0) {
        APIErrorService.save('Notification.broadcast', e, undefined, undefined, notification);
        return undefined;
      }
      console.log(`Retrying in ~${retryDelaySchedule[0]} seconds...`);
      await delay(retryDelaySchedule[0]);
      return broadcast(notification, retryDelaySchedule.slice(1));
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
    if (__broadcastInterval) {
      clearInterval(__broadcastInterval);
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
   *                                         MODULE BUILD                                         *
   ********************************************************************************************** */
  return Object.freeze({
    // properties
    // ...

    // broadcaster
    broadcast,

    // initializer
    initialize,
    teardown,

    // api initializer
    apiInit,
    apiInitError,
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
