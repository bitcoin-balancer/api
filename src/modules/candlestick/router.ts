import { Router, Request, Response } from 'express';
import { buildResponse } from 'api-response-utils';
import { lowRiskLimit } from '../../middlewares/rate-limit/index.js';
import { checkRequest } from '../shared/request-guard/index.js';
import { APIErrorService } from '../api-error/index.js';
import { CandlestickService } from './index.js';

const CandlestickRouter = Router();

/* ************************************************************************************************
 *                                         IMPLEMENTATION                                         *
 ************************************************************************************************ */

/**
 * Retrieves the history for an event based on its ID.
 * @returns IAPIResponse<IEventHistoryRecord>
 * @requirements
 * - authority: 1
 */
CandlestickRouter.route('/event-history/:id').get(lowRiskLimit, async (req: Request, res: Response) => {
  let reqUid: string | undefined;
  try {
    reqUid = await checkRequest(req.get('authorization'), req.ip, 1);
    res.json(buildResponse(await CandlestickService.getEventHistory(req.params.id)));
  } catch (e) {
    APIErrorService.save('CandlestickRouter.get.event-history', e, reqUid, req.ip);
    res.json(buildResponse(undefined, e));
  }
});





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  CandlestickRouter,
};
