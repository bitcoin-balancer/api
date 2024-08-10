

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

  // initializer
  initialize: () => Promise<void>;
  teardown: () => Promise<void>;

  // broadcaster
  broadcast: (notification: IPreSaveNotification, retryDelaySchedule?: number[]) => Promise<void>;

  // api initializer
  apiInit: () => void;
  apiInitError: (error: any) => Promise<void>;

  // server alarms
  highCPULoad: (current: number, limit: number) => void;
  highMemoryUsage: (current: number, limit: number) => void;
  highFileSystemUsage: (current: number, limit: number) => void;
};





/* ************************************************************************************************
 *                                             TYPES                                              *
 ************************************************************************************************ */

/**
 * Notification Sender
 * The sender can be a module or even a specific event.
 */
type INotificationSender = 'AUTOMATED_TEST' | 'API_ERROR' | 'API_INITIALIZER' | 'SERVER';

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

  // types
  INotificationSender,
  INotification,
  IPreSaveNotification,
};
