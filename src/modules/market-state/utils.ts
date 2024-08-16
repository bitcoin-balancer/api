import { WindowService } from './window/index.js';
import { IMarketState } from './types.js';

/* ************************************************************************************************
 *                                         IMPLEMENTATION                                         *
 ************************************************************************************************ */

/**
 * Builds the Market State object in pristine state.
 * @returns IMarketState
 */
const buildPristineState = (): IMarketState => ({
  window: WindowService.getPristineState(),
});





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  buildPristineState,
};
