import { Router, Request, Response } from 'express';
import { buildResponse } from 'api-response-utils';
import { veryLowRiskLimit } from '../../middlewares/rate-limit/index.js';
import { checkRequest } from '../shared/request-guard/index.js';
import { APIErrorService } from '../api-error/index.js';
import { NotificationService } from './index.js';

const NotificationRouter = Router();

/* ************************************************************************************************
 *                                         IMPLEMENTATION                                         *
 ************************************************************************************************ */

/**
 * Retrieves a series of API Errors. If the startAtID is provided, it will start at that point
 * exclusively.
 * @param startAtID?
 * @returns IAPIResponse<INotification[]>
 * @requirements
 * - authority: 2
 */
NotificationRouter.route('/').get(veryLowRiskLimit, async (req: Request, res: Response) => {
  let reqUid: string | undefined;
  try {
    reqUid = await checkRequest(req.get('authorization'), req.ip, 2, ['limit'], req.query);
    res.json(buildResponse(await NotificationService.list(
      Number(req.query.limit),
      typeof req.query.startAtID === 'string' ? Number(req.query.startAtID) : undefined,
    )));
  } catch (e) {
    APIErrorService.save('NotificationRouter.get', e, reqUid, req.ip, req.query);
    res.json(buildResponse(undefined, e));
  }
});





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  NotificationRouter,
};
