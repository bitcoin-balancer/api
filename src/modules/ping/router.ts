import { Router, Request, Response } from 'express';
import { buildResponse } from 'api-response-utils';
import { veryHighRiskLimit } from '../../middlewares/rate-limit/index.js';

const PingRouter = Router();

/* ************************************************************************************************
 *                                         IMPLEMENTATION                                         *
 ************************************************************************************************ */

/**
 * Sends the client's IP Address in the response. This route is used to ensure the API is running.
 * @returns IAPIResponse<string>
 */
PingRouter.route('/').get(veryHighRiskLimit, (req: Request, res: Response) => {
  console.log(req.get('authorization'));
  res.json(buildResponse(req.ip));
});





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  PingRouter,
};
