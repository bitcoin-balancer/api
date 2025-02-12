/* eslint-disable no-console */
import ms from 'ms';
import { subDays } from 'date-fns';
import { extractMessage } from 'error-message-utils';
import { retryAsyncFunction } from 'web-utils-kit';
import { sendPOST } from 'fetch-request-node';
import { ENVIRONMENT, ITelegramConfig } from '../shared/environment/index.js';
import { APIErrorService } from '../api-error/index.js';
import {
  buildRequestInput,
  toMessage,
  prettifyDollarValue,
  prettifyBitcoinValue,
  prettifyDate,
} from './utils.js';
import { ISide } from '../shared/exchange/index.js';
import { IState } from '../market-state/shared/types.js';
import { canRecordsBeListed } from './validations.js';
import { listRecords, saveRecord, deleteOldRecords } from './model.js';
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

  // notifications are broadcasted (every __BROADCAST_FREQUENCY seconds) in a queue because modules
  // like APIErrors can spam messages
  const __queue: IPreSaveNotification[] = [];
  const __QUEUE_LIMIT: number = 7;
  const __BROADCAST_FREQUENCY: number = 10;
  let __broadcastInterval: NodeJS.Timeout;

  // the highest number of days notification records will be kept for
  const __MAX_AGE = 30;





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
        await retryAsyncFunction(
          () => sendPOST(buildRequestInput(
            __CONFIG.token,
            __CONFIG.chatID,
            toMessage(notification),
          )),
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
    if (__CONFIG && __queue.length < __QUEUE_LIMIT) {
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
    title: `${id} WebSocket error`,
    description: `${error} - If the data stream is not restored in a few minutes, consider restarting Balancer in order to try again.`,
  });

  /**
   * Broadcasts a message notifying users there are issues with the websocket connection.
   * @param id
   */
  const websocketConnectionIssue = (id: string): void => __addToQueue({
    sender: 'WEBSOCKET',
    title: `${id} WebSocket issue`,
    description: 'The WebSocket has not broadcasted data in an irregular period of time. Balancer will attempt to restore the connection in a few seconds. If this issue persists, you may need to restart Balancer.',
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
   * @param state
   * @param price
   * @param change
   */
  const windowState = (state: IState, price: number, change: number): void => __addToQueue({
    sender: 'MARKET_STATE',
    title: `Bitcoin is ${state > 0 ? 'increasing' : 'decreasing'}`,
    description: `The price has changed ${change > 0 ? '%2b' : ''}${change}% in the window and is currently at ${prettifyDollarValue(price)}`,
  });

  /**
   * Broadcasts a message notifying users the window could not be updated.
   */
  const onInvalidWindowIntegrity = (): void => __addToQueue({
    sender: 'MARKET_STATE',
    title: 'Failed to refetch window',
    description: 'It appears there\'s an issue with the candlestick data received from the exchange (invalid integrity), preventing the window from updating. This could be due to a temporary data glitch or a more persistent issue. Check the logs for more information. If this error persists, consider restarting Balancer.',
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
   *                                         TRANSACTION                                          *
   ********************************************************************************************** */

  /**
   * Broadcasts a message notifying users the transaction failed to execute.
   * @param side
   * @param amount
   * @param error
   */
  const failedToExecuteTX = (side: ISide, amount: number, error: string): void => __addToQueue({
    sender: 'TRANSACTION',
    title: 'Failed to execute transaction',
    description: `The ${side === 'BUY' ? 'increase' : 'decrease'} transaction for ${prettifyBitcoinValue(amount)} could not be executed. Error: ${error}`,
  });

  /**
   * Broadcasts a message notifying users the transaction was executed successfully.
   * @param side
   * @param amount
   */
  const txExecutedSuccessfully = (side: ISide, amount: number): void => __addToQueue({
    sender: 'TRANSACTION',
    title: 'Transaction executed and confirmed',
    description: `The ${side === 'BUY' ? 'increase' : 'decrease'} transaction for ${prettifyBitcoinValue(amount)} was executed successfully.`,
  });





  /* **********************************************************************************************
   *                                           POSITION                                           *
   ********************************************************************************************** */

  /**
   * Broadcasts a message notifying users there was an error when attempting to initialize a tx.
   * @param error
   */
  const failedToInitializeTransaction = (error: string): void => __addToQueue({
    sender: 'POSITION',
    title: 'Failed to initialize transaction',
    description: error,
  });

  /**
   * Broadcasts a message notifying users the position could not be increased or decreased because
   * the account does not have enough balance.
   * @param side
   * @param has
   * @param needs
   */
  const insufficientBalance = (side: ISide, has: number, needs: number): void => __addToQueue({
    sender: 'POSITION',
    title: 'Insufficient balance',
    description: `The position could not be ${side === 'BUY' ? 'increased' : 'decreased'} as the balance is lower than the minimum. Has: ${side === 'BUY' ? prettifyDollarValue(has) : prettifyBitcoinValue(has)} | Needs: ${side === 'BUY' ? prettifyDollarValue(needs) : prettifyBitcoinValue(has)}.`,
  });

  /**
   * Broadcasts a message notifying users the position will be partially increased or decreased due
   * to insufficient funds.
   * @param side
   * @param has
   * @param needs
   */
  const lowBalance = (side: ISide, has: number, needs: number): void => __addToQueue({
    sender: 'POSITION',
    title: 'Low balance',
    description: `The position will be partially ${side === 'BUY' ? 'increased' : 'decreased'} due to insufficient funds. Has: ${side === 'BUY' ? prettifyDollarValue(has) : prettifyBitcoinValue(has)} | Needs: ${side === 'BUY' ? prettifyDollarValue(needs) : prettifyBitcoinValue(has)}.`,
  });

  /**
   * Broadcasts a message notifying users a new position has been opened.
   * @param amount
   * @param amountQuote
   * @param marketPrice
   */
  const onNewPosition = (
    amount: number,
    amountQuote: number,
    marketPrice: number,
  ): void => __addToQueue({
    sender: 'POSITION',
    title: 'A position has been opened',
    description: `A position worth ${prettifyBitcoinValue(amount)} (${prettifyDollarValue(amountQuote)}) has been opened at a rate of ${prettifyDollarValue(marketPrice)}.`,
  });

  /**
   * Broadcasts a message notifying users a new position has been closed.
   * @param openTime
   * @param pnl
   * @param roi
   */
  const onPositionClose = (
    openTime: number,
    pnl: number,
    roi: number,
  ): void => __addToQueue({
    sender: 'POSITION',
    title: 'The position has been closed',
    description: `The position opened on ${prettifyDate(openTime)} has been closed with a PNL of ${pnl > 0 ? '%2b' : ''}${prettifyDollarValue(pnl)} (${roi > 0 ? '%2b' : ''}${roi}%).`,
  });





  /* **********************************************************************************************
   *                                       POSITION PLANNER                                       *
   ********************************************************************************************** */

  /**
   * Broadcasts a message notifying users that Balancer will be unable to open/increase a position
   * if the balance isn't filled.
   * @param missingQuoteAmount
   * @param isOpen
   */
  const onInsufficientQuoteBalance = (
    missingQuoteAmount: number,
    isOpen: boolean,
  ): void => __addToQueue({
    sender: 'POSITION_PLANNER',
    title: 'Insufficient funds',
    description: `Please deposit ${prettifyDollarValue(missingQuoteAmount)} to your Spot Wallet to ${isOpen ? 'open a position' : 'increase the position'}. Disable "Auto-increase" in Adjustments/Strategy to silence this alert.`,
  });

  /**
   * Broadcasts a message notifying users that Balancer will be unable to decrease a position
   * if the balance isn't filled.
   * @param missingBaseAmount
   */
  const onInsufficientBaseBalance = (missingBaseAmount: number): void => __addToQueue({
    sender: 'POSITION_PLANNER',
    title: 'Insufficient funds',
    description: `Please deposit ${prettifyBitcoinValue(missingBaseAmount)} to your Spot Wallet to decrease the amount of the position. Disable "Auto-decrease" in Adjustments/Strategy to silence this alert.`,
  });





  /* **********************************************************************************************
   *                                          INITIALIZER                                         *
   ********************************************************************************************** */

  /**
   * Initializes the Notification Module if the configuration was provided.
   * @returns Promise<void>
   */
  const initialize = async (): Promise<void> => {
    // start the broadcasting interval
    if (__CONFIG) {
      __broadcastInterval = setInterval(async () => {
        if (__queue.length) {
          await broadcast(<INotification>__queue.shift());
        }
      }, ms(`${__BROADCAST_FREQUENCY} seconds`));
    }

    // delete old notifications
    await deleteOldRecords(subDays(Date.now(), __MAX_AGE).getTime());
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
    onInvalidWindowIntegrity,
    onReversalEvent,

    // transaction
    failedToExecuteTX,
    txExecutedSuccessfully,

    // position
    failedToInitializeTransaction,
    insufficientBalance,
    lowBalance,
    onNewPosition,
    onPositionClose,

    // position planner
    onInsufficientQuoteBalance,
    onInsufficientBaseBalance,

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
