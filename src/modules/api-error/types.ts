

/* ************************************************************************************************
 *                                            SERVICE                                             *
 ************************************************************************************************ */

/**
 * API Error Service
 * Object in charge of managing the storage and retrieval of errors thrown within the API.
 */
type IAPIErrorService = {
  // properties
  unreadCount: number;

  // actions
  save: (
    origin: IAPIErrorOrigin,
    error: any,
    uid?: string,
    ip?: string,
    args?: Record<string, any>,
  ) => Promise<void>;
  list: (limit: number, startAtID: number | undefined) => Promise<IAPIError[]>;
  deleteAll: () => Promise<void>;
};





/* ************************************************************************************************
 *                                             TYPES                                              *
 ************************************************************************************************ */

/**
 * API Error Origin
 * The invocation that triggered the error. It can be a specific function or a route.
 */
type IAPIErrorOrigin = 'AutomatedTest' | 'Notification.broadcast' | 'APIErrorRouter.get'
| 'APIErrorRouter.delete' | 'PingRouter.get' | 'AltchaRouter.get' | 'IPBlacklistRouter.get'
| 'IPBlacklistRouter.post' | 'IPBlacklistRouter.put' | 'IPBlacklistRouter.delete'
| 'UserRouter.get' | 'UserRouter.get.otp-secret' | 'UserRouter.get.password-updates'
| 'UserRouter.post' | 'UserRouter.patch.nickname' | 'UserRouter.patch.authority'
| 'UserRouter.patch.password' | 'UserRouter.patch.otpSecret' | 'UserRouter.delete' | 'JWTRouter.get'
| 'JWTRouter.post.sign-in' | 'JWTRouter.post.refresh-jwt' | 'JWTRouter.post.sign-out'
| 'VersionService.initialize.__buildVersion' | 'ServerRouter.get' | 'ServerRouter.get.alarms'
| 'ServerRouter.put.alarms' | 'ServerService.initialize.__refetchState' | 'DatabaseRouter.get.summary'
| 'DataJoinRouter.get.app-essentials' | 'DataJoinService.initialize.emitCompactAppEssentials'
| 'NotificationRouter.get' | 'WindowService.__refetchInterval' | 'WindowService.updateConfiguration.shouldReInitialize'
| 'WindowService.updateConfiguration.shouldFetchInitialCandlesticks' | 'MarketStateService.__onWindowChanges'
| 'MarketStateRouter.get.window.config' | 'MarketStateRouter.put.window.config' | 'CoinsService.updateConfiguration.postActions'
| 'MarketStateRouter.get.coins.config' | 'MarketStateRouter.put.coins.config' | 'WebSocket.COINS.error'
| 'WebSocket.LIQUIDITY.error' | 'WebSocket.COINS.close' | 'WebSocket.LIQUIDITY.close' | 'WebSocket.HealthCheck'
| 'MarketStateRouter.get.coins.state.asset.symbol' | 'MarketStateRouter.get.coins.state.asset'
| 'MarketStateRouter.get.liquidity.state' | 'MarketStateRouter.get.liquidity.config' | 'MarketStateRouter.put.liquidity.config'
| 'MarketStateRouter.get.reversal.config' | 'MarketStateRouter.put.reversal.config' | 'MarketStateRouter.get.reversal.record'
| 'MarketStateRouter.get.reversal.records' | 'MarketStateRouter.get.reversal.event-history' | 'OrderBook.interval.refetch'
| 'BalanceService.__refetchInterval' | 'PositionRouter.get.balances' | 'PositionRouter.get.strategy' | 'PositionRouter.put.strategy'
| 'PositionRouter.get.record' | 'PositionRouter.get.records' | 'TradeService.__syncInterval';

/**
 * API Error
 * The record of the error that is stored in the database.
 */
type IAPIError = {
  // the autoincrementing integer used to identify a record
  id: number;

  // the origin of the error
  origin: IAPIErrorOrigin;

  // the error message (encoded in case it was generated w/ error-message-utils)
  error: string;

  // the timestamp when the error was thrown
  event_time: number;

  // the identifier of the user who sent the request
  uid: string | null;

  // the ip address of the user who sent the request
  ip: string | null;

  // the arguments used when the error was thrown
  args: Record<string, any> | null;
};





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export type {
  // service
  IAPIErrorService,

  // types
  IAPIErrorOrigin,
  IAPIError,
};
