import { IRequestInput } from 'fetch-request-node';
import { INotification } from './types.js';

/* ************************************************************************************************
 *                                         IMPLEMENTATION                                         *
 ************************************************************************************************ */

/**
 * Converts a notification into a message that is ready to be broadcasted.
 * @param notification
 * @returns string
 */
const toMessage = (notification: INotification): string => (
  `${notification.sender}\n${notification.title}\n${notification.description}`
);

/**
 * Builds the URL and the message that will be broadcasted through the Telegram group.
 * @param token
 * @param chatID
 * @param messsage
 * @returns IRequestInput
 */
const buildRequestInput = (token: string, chatID: number, message: string): IRequestInput => (
  `https://api.telegram.org/bot${token}/sendMessage?chat_id=${chatID}&text=${message}`
);





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  toMessage,
  buildRequestInput,
};
