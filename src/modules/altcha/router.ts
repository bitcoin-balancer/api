import { Router, Request, Response } from 'express';
import { buildResponse } from 'api-response-utils';
import { highRiskLimit } from '../../middlewares/rate-limit/index.js';
import { checkPublicRequest } from '../shared/request-guard/index.js';
import { APIErrorService } from '../api-error/index.js';
import { AltchaService } from './index.js';

const AltchaRouter = Router();

/* ************************************************************************************************
 *                                         IMPLEMENTATION                                         *
 ************************************************************************************************ */

/**
 * Creates an Altcha Challenge ready to be sent to the client.
 * @returns IChallenge
 */
AltchaRouter.route('/').get(highRiskLimit, async (req: Request, res: Response) => {
  try {
    checkPublicRequest(req.ip);
    res.json(await AltchaService.create());
  } catch (e) {
    APIErrorService.save('AltchaRouter.get', e, undefined, req.ip);
    res.json(buildResponse(undefined, e));
  }
});

/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export { AltchaRouter };
