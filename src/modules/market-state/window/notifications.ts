import { NotificationService, throttleableNotificationFactory } from '../../notification/index.js';

/* ************************************************************************************************
 *                                         IMPLEMENTATION                                         *
 ************************************************************************************************ */

// if the window has a strong state, a notification will be sent every ~60 minutes
const __increasingStateNotification = throttleableNotificationFactory(
  NotificationService.windowState,
  60,
);
const __decreasingStateNotification = throttleableNotificationFactory(
  NotificationService.windowState,
  60,
);

/**
 * Broadcasts the current state of the window if it is moving strongly.
 * @param state
 * @param price
 * @param change
 */
const broadcastState = (state: 2 | -2, price: number, change: number): void => {
  if (state === 2) {
    __increasingStateNotification.broadcast([state, price, change]);
  } else {
    __decreasingStateNotification.broadcast([state, price, change]);
  }
};

/**
 * Broadcasts a message notifying users the window could not be updated.
 */
const broadcastInvalidWindowIntegrity = (): void => NotificationService.onInvalidWindowIntegrity();





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  broadcastState,
  broadcastInvalidWindowIntegrity,
};
