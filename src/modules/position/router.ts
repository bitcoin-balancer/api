import { Router, Request, Response } from 'express';
import { buildResponse } from 'api-response-utils';
import { lowRiskLimit, mediumRiskLimit } from '../../middlewares/rate-limit/index.js';
import { checkRequest } from '../shared/request-guard/index.js';
import { APIErrorService } from '../api-error/index.js';
import { StrategyService } from './strategy/index.js';
import { BalanceService } from './balance/index.js';


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
 *                                            BALANCES                                            *
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
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  PositionRouter,
};
