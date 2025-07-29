import { Router, Request, Response } from 'express';
import { buildResponse } from 'api-response-utils';
import { veryHighRiskLimit } from '../../middlewares/rate-limit/index.js';
import { checkRequest } from '../shared/request-guard/index.js';
import { APIErrorService } from '../api-error/index.js';
import { DatabaseService } from './index.js';

const DatabaseRouter = Router();

/* ************************************************************************************************
 *                                         IMPLEMENTATION                                         *
 ************************************************************************************************ */

/**
 * Retrieves the summary of the database.
 * @returns IAPIResponse<IDatabaseSummary>
 * @requirements
 * - authority: 2
 */
DatabaseRouter.route('/summary').get(veryHighRiskLimit, async (req: Request, res: Response) => {
  let reqUid: string | undefined;
  try {
    reqUid = await checkRequest(req.get('authorization'), req.ip, 2);
    res.json(buildResponse(await DatabaseService.getDatabaseSummary()));
  } catch (e) {
    APIErrorService.save('DatabaseRouter.get.summary', e, reqUid, req.ip);
    res.json(buildResponse(undefined, e));
  }
});

/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export { DatabaseRouter };
