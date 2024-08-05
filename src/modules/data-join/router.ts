import { Router, Request, Response } from 'express';
import { buildResponse } from 'api-response-utils';
import { lowRiskLimit } from '../../middlewares/rate-limit/index.js';
import { checkRequest } from '../shared/request-guard/index.js';
import { APIErrorService } from '../api-error/index.js';
import { DataJoinService } from './index.js';

const DataJoinRouter = Router();

/* ************************************************************************************************
 *                                         IMPLEMENTATION                                         *
 ************************************************************************************************ */

/**
 * Retrieves the App Essentials for an authenticated user.
 * @returns IAPIResponse<IAppEssentials>
 * @requirements
 * - authority: 1
 */
DataJoinRouter.route('/app-essentials').get(lowRiskLimit, async (req: Request, res: Response) => {
  let reqUid: string | undefined;
  try {
    reqUid = await checkRequest(req.get('authorization'), req.ip, 1);
    res.json(buildResponse(DataJoinService.getAppEssentials(reqUid)));
  } catch (e) {
    APIErrorService.save('DataJoinRouter.get.app-essentials', e, reqUid, req.ip);
    res.json(buildResponse(undefined, e));
  }
});





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  DataJoinRouter,
};
