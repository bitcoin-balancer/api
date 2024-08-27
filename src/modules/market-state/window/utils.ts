import { buildPristineCompactCandlestickRecords } from '../../shared/candlestick/index.js';
import { ENVIRONMENT } from '../../shared/environment/index.js';
import { IWindowConfig, IWindowState } from './types.js';

/* ************************************************************************************************
 *                                         IMPLEMENTATION                                         *
 ************************************************************************************************ */

/**
 * Retrieves the default re-fetch frequency based on the exchange set for the window and their
 * rate limitting.
 * @returns number
 */
const __getDefaultRefetchFrequency = (): number => {
  switch (ENVIRONMENT.EXCHANGE_CONFIGURATION.window) {
    case 'kraken':
      return 10;
    default:
      return 2.5;
  }
};

/**
 * Builds the default configuration object.
 * @returns IWindowConfig
 */
const buildDefaultConfig = (): IWindowConfig => ({
  refetchFrequency: __getDefaultRefetchFrequency(),
  size: 128,
  interval: '15m',
  requirement: 0.025,
  strongRequirement: 0.85,
});

/**
 * Builds the pristine state object.
 * @returns IWindowState
 */
const buildPristineState = (): IWindowState => ({
  state: 0,
  splitStates: {
    s100: { state: 0, change: 0 },
    s75: { state: 0, change: 0 },
    s50: { state: 0, change: 0 },
    s25: { state: 0, change: 0 },
    s15: { state: 0, change: 0 },
    s10: { state: 0, change: 0 },
    s5: { state: 0, change: 0 },
    s2: { state: 0, change: 0 },
  },
  window: buildPristineCompactCandlestickRecords(),
});

/**
 * When the configuration is updated, additional actions may be required based on the properties
 * that changed.
 * - The module should be reinitialized if the refetchFrequency or interval changed
 * - The candlesticks should be refetched anew if the window size changed
 * @param oldConfig
 * @param newConfig
 * @returns { shouldReInitialize: boolean, shouldFetchInitialCandlesticks: boolean }
 */
const getConfigUpdatePostActions = (
  oldConfig: IWindowConfig,
  newConfig: IWindowConfig,
): { shouldReInitialize: boolean, shouldFetchInitialCandlesticks: boolean } => ({
  shouldReInitialize: (
    oldConfig.refetchFrequency !== newConfig.refetchFrequency
    || oldConfig.interval !== newConfig.interval
  ),
  shouldFetchInitialCandlesticks: oldConfig.size !== newConfig.size,
});





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  buildDefaultConfig,
  buildPristineState,
  getConfigUpdatePostActions,
};
