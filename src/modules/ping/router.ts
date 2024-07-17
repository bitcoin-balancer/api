import { Router, Request, Response } from 'express';
import { buildResponse } from 'api-response-utils';
import { veryHighRiskLimit } from '../../middlewares/rate-limit/index.js';
import { checkPublicRequest } from '../shared/request-guard/index.js';
import { APIErrorService } from '../api-error/index.js';

const PingRouter = Router();

/* ************************************************************************************************
 *                                         IMPLEMENTATION                                         *
 ************************************************************************************************ */

/**
 * Sends the client's IP Address in the response. This route is used to ensure the API is running.
 * @returns IAPIResponse<string>
 */
PingRouter.route('/').get(veryHighRiskLimit, (req: Request, res: Response) => {
  try {
    checkPublicRequest(req.ip);
    res.json(buildResponse(req.ip));
  } catch (e) {
    APIErrorService.save('PingRouter.get', e, undefined, req.ip);
    res.json(buildResponse(undefined, e));
  }
});





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  PingRouter,
};
