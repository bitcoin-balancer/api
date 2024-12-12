import { fromHoursToMinutes } from '../../shared/utils/index.js';
import { NotificationService, throttleableNotificationFactory } from '../../notification/index.js';

/* ************************************************************************************************
 *                                           CONSTANTS                                            *
 ************************************************************************************************ */

// the number of hours it will take for Balancer to re-send the notification
const __THROTTLE_DURATION = fromHoursToMinutes(6);





/* ************************************************************************************************
 *                                         IMPLEMENTATION                                         *
 ************************************************************************************************ */

/**
 * Fires when there isn't enough quote balance to open/increase a position.
 */
const onInsufficientQuoteBalance = throttleableNotificationFactory(
  NotificationService.onInsufficientQuoteBalance,
  __THROTTLE_DURATION,
);

/**
 * Fires when there isn't enough base balance to decrease a position.
 */
const onInsufficientBaseBalance = throttleableNotificationFactory(
  NotificationService.onInsufficientBaseBalance,
  __THROTTLE_DURATION,
);




/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  onInsufficientQuoteBalance,
  onInsufficientBaseBalance,
};
