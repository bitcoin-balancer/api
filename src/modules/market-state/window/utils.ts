import { buildPristineCompactCandlestickRecords } from '../../shared/candlestick/index.js';
import { ICandlestickInterval } from '../../shared/exchange/index.js';
import { IWindowConfig, IWindowState } from './types.js';

/* ************************************************************************************************
 *                                           CONSTANTS                                            *
 ************************************************************************************************ */

// the number of ms each of the supported intervals last
const __INTERVAL_DURATION: { [key in ICandlestickInterval]: number } = {
  '1m': 60 * 1000,
  '5m': 300 * 1000,
  '15m': 900 * 1000,
  '30m': 1800 * 1000,
  '1h': 3600 * 1000,
  '1d': 86400 * 1000,
  '1w': 604800 * 1000,
};





/* ************************************************************************************************
 *                                         IMPLEMENTATION                                         *
 ************************************************************************************************ */

/**
 * Builds the default configuration object.
 * @returns IWindowConfig
 */
const buildDefaultConfig = (): IWindowConfig => ({
  refetchFrequency: 2.5,
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

/**
 * Calculates the number (float) of candlestick bars the local window is currently behind by. Keep
 * in mind it is normal for the candlesticks to be ~1 bar behind. If the lag is >= 1.1 there could
 * be an issue.
 * @param interval
 * @param currentOpenTime
 * @returns number
 */
const calculateSyncLag = (interval: ICandlestickInterval, currentOpenTime: number): number => {
  // calculate the difference in secs between the current time and the last candlestick's open time
  const diff = Date.now() - currentOpenTime;

  // calculate the number of bars the window is currently behind by
  return diff / __INTERVAL_DURATION[interval];
};




/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  buildDefaultConfig,
  buildPristineState,
  getConfigUpdatePostActions,
  calculateSyncLag,
};
