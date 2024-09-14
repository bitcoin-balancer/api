import { Router, Request, Response } from 'express';
import { buildResponse } from 'api-response-utils';
import {
  lowRiskLimit,
  mediumRiskLimit,
  veryLowRiskLimit,
} from '../../middlewares/rate-limit/index.js';
import { checkRequest } from '../shared/request-guard/index.js';
import { APIErrorService } from '../api-error/index.js';
import { StrategyService } from './strategy/index.js';
import { BalanceService } from './balance/index.js';
import { TransactionService } from './transaction/index.js';
import { PositionService } from './index.js';

const PositionRouter = Router();

/* ************************************************************************************************
 *                                            STRATEGY                                            *
 ************************************************************************************************ */

/**
 * Retrieves the strategy.
 * @returns IAPIResponse<IStrategy>
 * @requirements
 * - authority: 2
 */
PositionRouter.route('/strategy').get(lowRiskLimit, async (req: Request, res: Response) => {
  let reqUid: string | undefined;
  try {
    reqUid = await checkRequest(req.get('authorization'), req.ip, 2);
    res.json(buildResponse(StrategyService.config));
  } catch (e) {
    APIErrorService.save('PositionRouter.get.strategy', e, reqUid, req.ip);
    res.json(buildResponse(undefined, e));
  }
});

/**
 * Updates the strategy.
 * @param newConfig
 * @returns IAPIResponse<void>
 * @requirements
 * - authority: 3
 * - otp-token
 */
PositionRouter.route('/strategy').put(mediumRiskLimit, async (req: Request, res: Response) => {
  let reqUid: string | undefined;
  try {
    reqUid = await checkRequest(
      req.get('authorization'),
      req.ip,
      3,
      ['newConfig'],
      req.body,
      req.get('otp-token') || '',
    );
    await StrategyService.updateConfiguration(req.body.newConfig);
    res.json(buildResponse());
  } catch (e) {
    APIErrorService.save('PositionRouter.put.strategy', e, reqUid, req.ip, req.body);
    res.json(buildResponse(undefined, e));
  }
});





/* ************************************************************************************************
 *                                            BALANCE                                             *
 ************************************************************************************************ */

/**
 * Retrieves the balances object from the local state.
 * @returns IAPIResponse<IBalances>
 * @requirements
 * - authority: 1
 */
PositionRouter.route('/balances').get(lowRiskLimit, async (req: Request, res: Response) => {
  let reqUid: string | undefined;
  try {
    reqUid = await checkRequest(req.get('authorization'), req.ip, 1);
    res.json(buildResponse(await BalanceService.getBalances()));
  } catch (e) {
    APIErrorService.save('PositionRouter.get.balances', e, reqUid, req.ip);
    res.json(buildResponse(undefined, e));
  }
});





/* ************************************************************************************************
 *                                          TRANSACTION                                           *
 ************************************************************************************************ */

/**
 * Retrieves a transaction record.
 * @returns IAPIResponse<ITransaction>
 * @requirements
 * - authority: 2
 */
PositionRouter.route('/transaction/:id').get(lowRiskLimit, async (req: Request, res: Response) => {
  let reqUid: string | undefined;
  try {
    reqUid = await checkRequest(req.get('authorization'), req.ip, 2);
    res.json(buildResponse(await TransactionService.getTransaction(Number(req.params.id))));
  } catch (e) {
    APIErrorService.save('PositionRouter.get.transaction', e, reqUid, req.ip, req.params);
    res.json(buildResponse(undefined, e));
  }
});

/**
 * Retrieves a series of transactions. If the startAtID is provided, it will start at that point
 * exclusively.
 * @param startAtID?
 * @returns IAPIResponse<ITransaction[]>
 * @requirements
 * - authority: 2
 */
PositionRouter.route('/transactions').get(veryLowRiskLimit, async (req: Request, res: Response) => {
  let reqUid: string | undefined;
  try {
    reqUid = await checkRequest(req.get('authorization'), req.ip, 2, ['limit'], req.query);
    res.json(buildResponse(await TransactionService.listTransactions(
      Number(req.query.limit),
      typeof req.query.startAtID === 'string' ? Number(req.query.startAtID) : undefined,
    )));
  } catch (e) {
    APIErrorService.save('PositionRouter.get.transactions', e, reqUid, req.ip, req.query);
    res.json(buildResponse(undefined, e));
  }
});





/* ************************************************************************************************
 *                                            POSITION                                            *
 ************************************************************************************************ */

/**
 * Retrieves a position record from the local property or from the database by ID.
 * @returns IAPIResponse<IPosition>
 * @requirements
 * - authority: 2
 */
PositionRouter.route('/record/:id').get(lowRiskLimit, async (req: Request, res: Response) => {
  let reqUid: string | undefined;
  try {
    reqUid = await checkRequest(req.get('authorization'), req.ip, 2);
    res.json(buildResponse(await PositionService.getPosition(req.params.id)));
  } catch (e) {
    APIErrorService.save('PositionRouter.get.record', e, reqUid, req.ip, req.params);
    res.json(buildResponse(undefined, e));
  }
});

/**
 * Validates and retrieves a list of compact position records.
 * @param limit
 * @param startAtOpenTime?
 * @returns IAPIResponse<ICompactPosition[]>
 * @requirements
 * - authority: 2
 */
PositionRouter.route('/records').get(lowRiskLimit, async (req: Request, res: Response) => {
  let reqUid: string | undefined;
  try {
    reqUid = await checkRequest(req.get('authorization'), req.ip, 2, ['limit'], req.query);
    res.json(buildResponse(await PositionService.listCompactPositions(
      Number(req.query.limit),
      typeof req.query.startAtOpenTime === 'string' ? Number(req.query.startAtOpenTime) : undefined,
    )));
  } catch (e) {
    APIErrorService.save('PositionRouter.get.records', e, reqUid, req.ip, req.query);
    res.json(buildResponse(undefined, e));
  }
});

/**
 * Validates and retrieves a list of compact position records by date range.
 * @param startAt
 * @param endAt?
 * @returns IAPIResponse<ICompactPosition[]>
 * @requirements
 * - authority: 2
 */
PositionRouter.route('/records/range').get(lowRiskLimit, async (req: Request, res: Response) => {
  let reqUid: string | undefined;
  try {
    reqUid = await checkRequest(req.get('authorization'), req.ip, 2, ['startAt'], req.query);
    res.json(buildResponse(await PositionService.listCompactPositionsByRange(
      Number(req.query.startAt),
      typeof req.query.endAt === 'string' ? Number(req.query.endAt) : undefined,
    )));
  } catch (e) {
    APIErrorService.save('PositionRouter.get.records.range', e, reqUid, req.ip, req.query);
    res.json(buildResponse(undefined, e));
  }
});





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  PositionRouter,
};
