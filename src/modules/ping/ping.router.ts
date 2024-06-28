import { Router, Request, Response } from 'express';
import { buildResponse } from 'api-response-utils';

// init the route
const PingRouter = Router();





/* ************************************************************************************************
 *                                         IMPLEMENTATION                                         *
 ************************************************************************************************ */

/**
 * Sends back the string 'pong' in the response. This route is used to ensure the API is running.
 * @returns IAPIResponse<string>
 */
PingRouter.route('/').get((req: Request, res: Response) => {
  console.log(req.clientIp);
  res.json(buildResponse('pong'));
});





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  PingRouter,
};
