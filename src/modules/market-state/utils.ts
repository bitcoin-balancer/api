import { WindowService } from './window/index.js';
import { LiquidityService } from './liquidity/index.js';
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
  liquidityState: LiquidityService.getPristineState(),
  reversalState: undefined,
});





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  buildPristineState,
};
