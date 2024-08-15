import { IWindowConfig, IWindowState } from './types.js';

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
  window: {
    id: [],
    open: [],
    high: [],
    low: [],
    close: [],
  },
});





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  buildDefaultConfig,
  buildPristineState,
};
