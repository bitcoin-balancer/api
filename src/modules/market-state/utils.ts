import { WindowService } from './window/index.js';
import { CoinsService } from './coins/index.js';
import { IMarketState } from './types.js';

/* ************************************************************************************************
 *                                         IMPLEMENTATION                                         *
 ************************************************************************************************ */

/**
 * Builds the Market State object in pristine state.
 * @returns IMarketState
 */
const buildPristineState = (): IMarketState => ({
  windowState: WindowService.getPristineState(),
  coinsStates: CoinsService.getPristineState(),
});





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  buildPristineState,
};
