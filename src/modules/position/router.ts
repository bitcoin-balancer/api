import { Router, Request, Response } from 'express';
import { buildResponse } from 'api-response-utils';
import { lowRiskLimit } from '../../middlewares/rate-limit/index.js';
import { checkRequest } from '../shared/request-guard/index.js';
import { APIErrorService } from '../api-error/index.js';
import { BalanceService } from './balance/index.js';

const PositionRouter = Router();

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
