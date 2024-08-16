

/* ************************************************************************************************
 *                                            SERVICE                                             *
 ************************************************************************************************ */

/**
 * Notification Service
 * Object in charge of broadcasting notifications through the Telegram Group.
 */
type INotificationService = {
  // properties
  unreadCount: number;

  // retrievers
  list: (limit: number, startAtID: number | undefined) => Promise<INotification[]>;

  // broadcaster
  broadcast: (notification: IPreSaveNotification, retryDelaySchedule?: number[]) => Promise<void>;

  // api initializer
  apiInit: () => void;
  apiInitError: (error: any) => Promise<void>;

  // server alarms
  highCPULoad: (current: number, limit: number) => void;
  highMemoryUsage: (current: number, limit: number) => void;
  highFileSystemUsage: (current: number, limit: number) => void;

  // market state
  marketStateError: (errorMessage: string) => void;
  windowState: (price: number, change: number) => void;

  // initializer
  initialize: () => Promise<void>;
  teardown: () => Promise<void>;
};




/* ************************************************************************************************
 *                                            FACTORY                                             *
 ************************************************************************************************ */

/**
 * Throttleable Notification Factory
 * Function in charge of generating ThrottleableNotification objects.
 */
type IThrottleableNotificationFactory = (
  // the notification function that will be used to broadcast
  func: (...args: any[]) => void,

  // the duration of the throttle in minutes
  duration: number,
) => IThrottleableNotification;

/**
 * Throttleable Notification
 * Object in charge of throttling the broadcasting of a notification.
 */
type IThrottleableNotification = {
  // properties
  // ...

  // actions
  broadcast: (args?: any[]) => void;
};





/* ************************************************************************************************
 *                                             TYPES                                              *
 ************************************************************************************************ */

/**
 * Notification Sender
 * The sender can be a module or even a specific event.
 */
type INotificationSender = 'AUTOMATED_TEST' | 'API_ERROR' | 'API_INITIALIZER' | 'SERVER'
| 'MARKET_STATE';

/**
 * Notification
 * A message can be broadcasted from any module, for any reason, at any time.
 */
type INotification = {
  // the identifier of the record
  id: number;

  // the origin of the event
  sender: INotificationSender;

  // information regarding the event that took place
  title: string;
  description: string;

  // the date in which the event took place
  event_time: number;
};

// partial notification utility type
type IPreSaveNotification = Omit<INotification, 'id'>;





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export type {
  // service
  INotificationService,

  // factory
  IThrottleableNotificationFactory,
  IThrottleableNotification,

  // types
  INotificationSender,
  INotification,
  IPreSaveNotification,
};
