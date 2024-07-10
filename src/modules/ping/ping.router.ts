import { Router, Request, Response } from 'express';
import { buildResponse } from 'api-response-utils';
import { veryHighRiskLimit } from '../../middlewares/rate-limit/index.js';

// init the route
const PingRouter = Router();





/* ************************************************************************************************
 *                                         IMPLEMENTATION                                         *
 ************************************************************************************************ */

/**
 * Sends back the string 'pong' in the response. This route is used to ensure the API is running.
 * @returns IAPIResponse<string>
 */
PingRouter.route('/').get(veryHighRiskLimit, (req: Request, res: Response) => {
  res.json(buildResponse(req.ip));
});





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  PingRouter,
};
