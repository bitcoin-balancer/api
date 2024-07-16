import { encodeError } from 'error-message-utils';
import { ipNotesValid, ipValid } from '../shared/validations/index.js';
import { getRecordByIP } from './model.js';

/* ************************************************************************************************
 *                                         IMPLEMENTATION                                         *
 ************************************************************************************************ */

/**
 * Verifies if an IP can be registered in the Blacklist.
 * @param ip
 * @param notes
 * @returns Promise<void>
 * @throws
 * - 5250: if the IP has an invalid format
 * - 5251: if the notes have been provided but are invalid
 * - 5252: if the IP Address has already been registered
 */
const canIPBeRegistered = async (ip: string, notes: string | undefined): Promise<void> => {
  if (!ipValid(ip)) {
    throw new Error(encodeError(`The IP Address '${ip}' is invalid.`, 5250));
  }
  if (typeof notes !== undefined && !ipNotesValid(notes)) {
    throw new Error(encodeError(`The IP Address Blacklisting notes are invalid. Received '${notes}'`, 5251));
  }
  if (await getRecordByIP(ip) !== undefined) {
    throw new Error(encodeError(`The IP Address '${ip}' has already been registered.`, 5252));
  }
};





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  canIPBeRegistered,
};
