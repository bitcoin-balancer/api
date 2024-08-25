import { Subscription } from 'rxjs';
import { IWindowState } from './window/index.js';

/* ************************************************************************************************
 *                                            SERVICE                                             *
 ************************************************************************************************ */

/**
 * Market State Service
 * Object in charge of brokering the state calculation across all the modules.
 */
type IMarketStateService = {
  // properties
  // ...

  // stream
  subscribe: (callback: (value: IMarketState) => any) => Subscription;

  // initializer
  teardown: () => Promise<void>;
  initialize: () => Promise<void>;
};





/* ************************************************************************************************
 *                                             TYPES                                              *
 ************************************************************************************************ */

/**
 * Market State
 * The object containing the up-to-date state for all Market State's submodules.
 */
type IMarketState = {
  // the state of the window module
  windowState: IWindowState;

  // ...
};




/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export type {
  // service
  IMarketStateService,

  // types
  IMarketState,
};
