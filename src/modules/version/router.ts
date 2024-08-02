import { Router, Request, Response } from 'express';
import { buildResponse } from 'api-response-utils';
import { mediumRiskLimit } from '../../middlewares/rate-limit/index.js';
import { checkRequest } from '../shared/request-guard/index.js';
import { APIErrorService } from '../api-error/index.js';
import { VersionService } from './index.js';

const VersionRouter = Router();

/* ************************************************************************************************
 *                                         IMPLEMENTATION                                         *
 ************************************************************************************************ */

/**
 * Retrieves the current version of Balancer's Platform.
 * @returns IAPIResponse<IServerState>
 * @requirements
 * - authority: 3
 */
VersionRouter.route('/').get(mediumRiskLimit, async (req: Request, res: Response) => {
  let reqUid: string | undefined;
  try {
    reqUid = await checkRequest(req.get('authorization'), req.ip, 3);
    res.json(buildResponse(VersionService.version));
  } catch (e) {
    APIErrorService.save('VersionRouter.get', e, reqUid, req.ip);
    res.json(buildResponse(undefined, e));
  }
});





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  VersionRouter,
};
