import { numberValid } from '../shared/validations/index.js';

/* ************************************************************************************************
 *                                         IMPLEMENTATION                                         *
 ************************************************************************************************ */



const canRecordsBeListed = (startAtID: number | undefined): void => {
  if (startAtID !== undefined && !numberValid(startAtID)) {
    // ...
  }
};





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  canRecordsBeListed,
};