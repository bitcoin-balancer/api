import { subMinutes } from 'date-fns';
import { IThrottleableNotificationFactory, IThrottleableNotification } from './types.js';

/* ************************************************************************************************
 *                                         IMPLEMENTATION                                         *
 ************************************************************************************************ */

/**
 * Some Service Factory
 * Generates the object in charge of throttling the broadcasting of a notification.
 * @returns IThrottleableNotification
 */
const throttleableNotificationFactory: IThrottleableNotificationFactory = (
  func: (args?: any[]) => void,
  duration: number,
): IThrottleableNotification => {
  /* **********************************************************************************************
   *                                          PROPERTIES                                          *
   ********************************************************************************************** */

  // the function that will be used to broadcast notifications
  const __FUNC = func;

  // the duration of the throttle in minutes
  const __DURATION = duration;

  // the time in ms of the last broadcast
  let __lastBroadcastedNotification: number | undefined;





  /* **********************************************************************************************
   *                                            ACTIONS                                           *
   ********************************************************************************************** */

  /**
   * Executes the notification function that was passed during instantiation.
   * @param args
   */
  const __executeFunc = (args: any[] | undefined): void => (args ? __FUNC(...args) : __FUNC());

  /**
   * Broadcasts the notification if throttle isn't currently enabled.
   * @param args?
   */
  const broadcast = (args?: any[]) => {
    if (
      __lastBroadcastedNotification === undefined
      || __lastBroadcastedNotification < subMinutes(Date.now(), __DURATION).getTime()
    ) {
      __executeFunc(args);
      __lastBroadcastedNotification = Date.now();
    }
  };





  /* **********************************************************************************************
   *                                         MODULE BUILD                                         *
   ********************************************************************************************** */
  return Object.freeze({
    // properties
    // ...

    // actions
    broadcast,
  });
};





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  throttleableNotificationFactory,
};
