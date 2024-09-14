import { IBalances, ISide } from '../../shared/exchange/index.js';

/* ************************************************************************************************
 *                                            SERVICE                                             *
 ************************************************************************************************ */

/**
 * Transaction Service
 * Object in charge of ensuring that position actions get executed properly.
 */
type ITransactionService = {
  // properties
  // ...

  // retrievers
  getTransaction: (id: number) => Promise<ITransaction>;
  listTransactionsByRange: (startAt: number, endAt?: number) => Promise<ITransaction[]>;

  // execution
  execute (side: ISide, amount: number, balances?: IBalances): Promise<number>;
};





/* ************************************************************************************************
 *                                             TYPES                                              *
 ************************************************************************************************ */

/**
 * Transaction Status
 * The state of the transaction. If 'FAILED' it means it ran out of attempts and won't try again.
 */
type ITransactionStatus = 'PROCESSING' | 'SUCCEEDED' | 'FAILED';

/**
 * Transaction Action Name
 * The steps that must be checked for a transaction to be considered successful.
 */
type ITransactionActionName = 'INITIAL_BALANCES' | 'EXECUTION' | 'CONFIRMATION';

/**
 * Transaction Log
 * Object containing all the data related to the event that took place.
 */
type ITransactionLog = {
  // the log that's being stored
  action: ITransactionActionName;

  // the time at which the log was recorded
  eventTime: number;

  // if true, the action was executed successfully
  outcome: boolean;

  // the data that was received when the event was executed
  payload?: Record<string, unknown> | IBalances;

  // the error message if the event failed to execute
  error?: string;
};

/**
 * Transaction
 * The object containing the tx's details as well as the timeline
 */
type ITransaction = {
  // the identifier of the tx
  id: number;

  // the timestamp in ms at which the transaction was started
  event_time: number;

  // the state of the tx
  status: ITransactionStatus;

  // the kind of action that will be executed
  side: ISide;

  // the amount of base asset that will be purchased or sold
  amount: number;

  // the list of logs generated when executing the tx
  logs: ITransactionLog[];
};

/**
 * Transaction Action Result
 * The result of executing an action. Regardless of the outcome, the logs must be stored.
 */
type ITransactionActionResult = {
  // the list of logs generated during the execution of the action
  logs: ITransactionLog[];

  // if it exists, the action failed to execute
  error?: string;
};





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export type {
  // service
  ITransactionService,

  // types
  ITransactionStatus,
  ITransactionActionName,
  ITransactionLog,
  ITransaction,
  ITransactionActionResult,
};
