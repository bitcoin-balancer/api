import systeminformation from 'systeminformation';
import { calculatePercentageRepresentation } from 'bignumber-utils';
import { sortRecords } from '../shared/utils/index.js';
import { ICPUState, IMemoryState, IFileSystemState } from './types.js';
import { IRecord } from '../shared/types.js';

/* ************************************************************************************************
 *                                         STATE BUILDERS                                         *
 ************************************************************************************************ */

/**
 * Builds the current state of the CPU.
 * @param raw
 * @returns ICPUState
 */
const __buildCPUState = (raw: IRecord<any>): ICPUState => ({
  avgLoad: raw.avgLoad ?? 0,
  currentLoad: raw.currentLoad ?? 0,
  currentLoadUser: raw.currentLoadUser ?? 0,
  currentLoadSystem: raw.currentLoadSystem ?? 0,
});

/**
 * Builds the current state of the virtual memory.
 * @param raw
 * @returns IMemoryState
 */
const __buildMemoryState = (raw: IRecord<any>): IMemoryState => ({
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
const __buildFileSystemState = (raw: IRecord<any>): IFileSystemState => ({
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
const __buildFileSystemStates = (raw: IRecord<any>[]): IFileSystemState[] => (
  raw.map(__buildFileSystemState).sort(sortRecords('use', 'desc'))
);





/* ************************************************************************************************
 *                                        RESOURCE SCANNER                                        *
 ************************************************************************************************ */

/**
 * Scans the server's resources and returns their states.
 * @returns Promise<{...}>
 */
const scanResources = async (): Promise<{
  uptime: number,
  cpu: ICPUState,
  memory: IMemoryState,
  fileSystem: IFileSystemState,
}> => {
  const data: IRecord<number | IRecord<any> | IRecord<any>[]> = await systeminformation.get({
    time: 'uptime',
    currentLoad: 'avgLoad, currentLoad, currentLoadUser, currentLoadSystem',
    mem: 'total, free, active',
    fsSize: 'fs, type, size, used, available, use, mount',
  });
  return {
    uptime: <number>data.uptime,
    cpu: __buildCPUState(<IRecord<any>>data.currentLoad),
    memory: __buildMemoryState(<IRecord<any>>data.mem),
    fileSystem: __buildFileSystemStates(<IRecord<any>[]>data.fsSize)[0],
  };
};





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  scanResources,
};
