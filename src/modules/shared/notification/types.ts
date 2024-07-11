

/* ************************************************************************************************
 *                                            SERVICE                                             *
 ************************************************************************************************ */

/**
 * Notification Service
 * Object in charge of broadcasting notifications through the Telegram Group.
 */
type INotificationService = {
  // properties
  // ...

  // initializer
  initialize: () => Promise<void>;
  teardown: () => Promise<void>;

  // broadcaster
  broadcast: (notification: INotification, retryDelaySchedule?: number[]) => Promise<void>;

  // api initializer
  apiInit: () => void;
  apiInitError: (error: any) => Promise<void>;
};





/* ************************************************************************************************
 *                                             TYPES                                              *
 ************************************************************************************************ */

/**
 * Notification Sender
 * The sender can be a module or even a specific event.
 */
type INotificationSender = 'AUTOMATED_TEST' | 'API_ERROR' | 'API_INITIALIZER';

/**
 * Notification
 * A message can be broadcasted from any module, for any reason, at any time.
 */
type INotification = {
  // the origin of the event
  sender: INotificationSender;

  // information regarding the event that took place
  title: string;
  description: string;
};





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export type {
  // service
  INotificationService,

  // types
  INotificationSender,
  INotification,
};
