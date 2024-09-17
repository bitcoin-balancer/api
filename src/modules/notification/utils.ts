import { format } from 'date-fns';
import { prettifyValue } from 'bignumber-utils';
import { IRequestInput } from 'fetch-request-node';
import { IPreSaveNotification } from './types.js';

/* ************************************************************************************************
 *                                         IMPLEMENTATION                                         *
 ************************************************************************************************ */

/**
 * Converts a notification into a message that is ready to be broadcasted.
 * @param notification
 * @returns string
 */
const toMessage = (notification: IPreSaveNotification): string => {
  let _ = '';
  _ += `${notification.sender}%0A`;
  _ += `${notification.title}%0A`;
  _ += `${notification.description}`;
  return _;
};

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

/**
 * Formats a timestamp into a human readable datetime.
 * @param date
 * @returns string
 */
const prettifyDate = (date: string | number | Date): string => format(date, 'PPpp');

/**
 * Prettifies a dollar value so it can be easily read by users.
 * @param value
 * @returns string
 */
const prettifyDollarValue = (value: number): string => (
  prettifyValue(value, { processing: { decimalPlaces: 2 }, format: { prefix: '$' } })
);

/**
 * Prettifies a btc value so it can be easily read by users.
 * @param value
 * @returns string
 */
const prettifyBitcoinValue = (value: number): string => (
  prettifyValue(value, { processing: { decimalPlaces: 8 }, format: { prefix: '₿' } })
);




/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  toMessage,
  buildRequestInput,
  prettifyDate,
  prettifyDollarValue,
  prettifyBitcoinValue,
};
