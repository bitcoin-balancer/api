import systeminformation from 'systeminformation';
import { sortRecords } from 'web-utils-kit';
import { calculatePercentageRepresentation, processValue } from 'bignumber-utils';
import { ICPUState, IMemoryState, IFileSystemState } from './types.js';

/* ************************************************************************************************
 *                                         STATE BUILDERS                                         *
 ************************************************************************************************ */

/**
 * Builds the current state of the CPU.
 * @param raw
 * @returns ICPUState
 */
const __buildCPUState = (raw: Record<string, any>): ICPUState => ({
  avgLoad: typeof raw.avgLoad === 'number' ? processValue(raw.avgLoad) : 0,
  currentLoad: typeof raw.currentLoad === 'number' ? processValue(raw.currentLoad) : 0,
  currentLoadUser: typeof raw.currentLoadUser === 'number' ? processValue(raw.currentLoadUser) : 0,
  currentLoadSystem:
    typeof raw.currentLoadSystem === 'number' ? processValue(raw.currentLoadSystem) : 0,
});

/**
 * Builds the current state of the virtual memory.
 * @param raw
 * @returns IMemoryState
 */
const __buildMemoryState = (raw: Record<string, any>): IMemoryState => ({
  total: raw.total ?? 0,
  free: raw.free ?? 0,
  active: raw.active ?? 0,
  usage: calculatePercentageRepresentation(raw.active, raw.total),
});

/**
 * Builds the current state of an individual file system.
 * @param raw
 * @returns IFileSystemState
 */
const __buildFileSystemState = (raw: Record<string, any>): IFileSystemState => ({
  fs: raw.fs ?? 'Unknown',
  type: raw.type ?? 'Unknown',
  size: raw.size ?? 0,
  used: raw.used ?? 0,
  available: raw.available ?? 0,
  use: raw.use ?? 0,
  mount: raw.mount ?? 'Unknown',
});

/**
 * Builds the states for all of the file systems and sorts them by usage descendingly.
 * @param raw
 * @return IFileSystemState[]
 */
const __buildFileSystemStates = (raw: Record<string, any>[]): IFileSystemState[] =>
  raw.map(__buildFileSystemState).sort(sortRecords('use', 'desc'));

/* ************************************************************************************************
 *                                        RESOURCE SCANNER                                        *
 ************************************************************************************************ */

/**
 * Scans the server's resources and returns their states.
 * @returns Promise<{...}>
 */
const scanResources = async (): Promise<{
  uptime: number;
  cpu: ICPUState;
  memory: IMemoryState;
  fileSystem: IFileSystemState;
}> => {
  const data: {
    time: { uptime: number };
    currentLoad: Record<string, any>;
    mem: Record<string, any>;
    fsSize: Record<string, any>[];
  } = await systeminformation.get({
    time: 'uptime',
    currentLoad: 'avgLoad, currentLoad, currentLoadUser, currentLoadSystem',
    mem: 'total, free, active',
    fsSize: 'fs, type, size, used, available, use, mount',
  });
  return {
    uptime: data.time.uptime,
    cpu: __buildCPUState(data.currentLoad),
    memory: __buildMemoryState(data.mem),
    fileSystem: __buildFileSystemStates(data.fsSize)[0],
  };
};

/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export { scanResources };
