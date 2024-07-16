

/* ************************************************************************************************
 *                                            SERVICE                                             *
 ************************************************************************************************ */

/**
 * IP Blacklist Service
 * Object in charge of keeping track of potentially malicious IP Addresses.
 */
type IIPBlacklistService = {
  // properties
  // ...

  // ip status
  isBlacklisted: (ip: string) => void;

  // initializer
  initialize: () => Promise<void>;
  teardown: () => Promise<void>;
};





/* ************************************************************************************************
 *                                             TYPES                                              *
 ************************************************************************************************ */

/**
 * IP Blacklist Record
 * The record of the blacklisting of an IP Address which is stored in the database.
 */
type IIPBlacklistRecord = {
  // the identifier of the registration
  id: number;

  // the IP being blacklisted
  ip: string;

  // the notes describing why the IP was blacklisted
  notes?: string;

  // the timestamp in ms of the registration
  event_time: number;
};





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export type {
  // service
  IIPBlacklistService,

  // types
  IIPBlacklistRecord,
};
