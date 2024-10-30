import { IWindowState, WindowService } from './window/index.js';
import { LiquidityService } from './liquidity/index.js';
import { CoinsService } from './coins/index.js';
import { IReversalState } from './reversal/index.js';
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

/**
 * Determines if the coins can be rotated based on the current market state.
 * @param window
 * @param reversal
 * @returns boolean
 */
const canCoinsBeRotated = (window: IWindowState, reversal: IReversalState | undefined): boolean => (
  window.state >= 0 && reversal === undefined
);




/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  buildPristineState,
  canCoinsBeRotated,
};
