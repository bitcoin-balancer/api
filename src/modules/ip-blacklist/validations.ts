import { encodeError } from 'error-message-utils';
import { integerValid, ipNotesValid, ipValid } from '../shared/validations/index.js';
import { IIPBlacklistRecord } from './types.js';
import { getRecordByIP } from './model.js';

/* ************************************************************************************************
 *                                         IMPLEMENTATION                                         *
 ************************************************************************************************ */

/**
 * Verifies if the IP Blacklist Records can be listed.
 * @param startAtID
 * @throws
 * - 5255: if the starting point is provided and is invalid
 */
const canBlacklistBeListed = (startAtID: number | undefined): void => {
  if (startAtID !== undefined && !integerValid(startAtID, 1)) {
    throw new Error(encodeError(`The IP Blacklist Records cannot be listed with an invalid startAtID. Received: ${startAtID}.`, 5255));
  }
};

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
  if (notes !== undefined && !ipNotesValid(notes)) {
    throw new Error(encodeError(`The IP Address Blacklisting notes are invalid. Received '${notes}'`, 5251));
  }
  if (await getRecordByIP(ip) !== undefined) {
    throw new Error(encodeError(`The IP Address '${ip}' has already been registered.`, 5252));
  }
};

/**
 * Verifies if an IP Registration can be updated.
 * @param id
 * @param ip
 * @param notes
 * @returns Promise<void>
 * @throws
 * - 5250: if the IP has an invalid format
 * - 5251: if the notes have been provided but are invalid
 * - 5252: if the identifier has an invalid format
 * - 5253: if the IP has already been blacklisted by a different record
 */
const canIPRegistrationBeUpdated = async (
  id: number,
  ip: string,
  notes: string | undefined,
): Promise<void> => {
  if (!ipValid(ip)) {
    throw new Error(encodeError(`The IP Address '${ip}' is invalid.`, 5250));
  }
  if (notes !== undefined && !ipNotesValid(notes)) {
    throw new Error(encodeError(`The IP Address Blacklisting notes are invalid. Received '${notes}'`, 5251));
  }
  if (!integerValid(id, 1)) {
    throw new Error(encodeError(`The identifier '${id}' for the IP Blacklist Record is invalid.`, 5252));
  }

  // make sure the IP hasn't been blacklisted by a different record
  const record = await getRecordByIP(ip);
  if (record !== undefined && record.id !== id) {
    throw new Error(encodeError(`The IP Address '${ip}' has already been blacklisted by another record.`, 5253));
  }
};

/**
 * Unregisters the record of a blacklisted IP Address.
 * @param record
 * @returns Promise<void>
 * @throws
 * - 5254: if the registration cannot be found in the database
 */
const canIPBeUnregistered = (id: number, record: IIPBlacklistRecord | undefined): void => {
  if (record === undefined) {
    throw new Error(encodeError(`The registration '${id}' cannot be unregistered because it doesn't exist.`, 5254));
  }
};





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  canBlacklistBeListed,
  canIPBeRegistered,
  canIPRegistrationBeUpdated,
  canIPBeUnregistered,
};