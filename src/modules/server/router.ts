import { Router, Request, Response } from 'express';
import { buildResponse } from 'api-response-utils';
import { lowRiskLimit, veryHighRiskLimit } from '../../middlewares/rate-limit/index.js';
import { checkRequest } from '../shared/request-guard/index.js';
import { APIErrorService } from '../api-error/index.js';
import { ServerService } from './index.js';

const ServerRouter = Router();

/* ************************************************************************************************
 *                                         IMPLEMENTATION                                         *
 ************************************************************************************************ */

/**
 * Retrieves the current state of the server.
 * @returns IAPIResponse<IServerState>
 * @requirements
 * - authority: 3
 */
ServerRouter.route('/').get(lowRiskLimit, async (req: Request, res: Response) => {
  let reqUid: string | undefined;
  try {
    reqUid = await checkRequest(req.get('authorization'), req.ip, 3);
    res.json(buildResponse(ServerService.state));
  } catch (e) {
    APIErrorService.save('ServerRouter.get', e, reqUid, req.ip);
    res.json(buildResponse(undefined, e));
  }
});

/**
 * Retrieves the alarms' configuration.
 * @returns IAPIResponse<IAlarmsConfiguration>
 * @requirements
 * - authority: 3
 */
ServerRouter.route('/alarms').get(lowRiskLimit, async (req: Request, res: Response) => {
  let reqUid: string | undefined;
  try {
    reqUid = await checkRequest(req.get('authorization'), req.ip, 3);
    res.json(buildResponse(ServerService.alarms));
  } catch (e) {
    APIErrorService.save('ServerRouter.get.alarms', e, reqUid, req.ip);
    res.json(buildResponse(undefined, e));
  }
});

/**
 * Updates the alarms' configuration.
 * @param newConfig
 * @returns IAPIResponse<void>
 * @requirements
 * - authority: 3
 * - otp-token
 */
ServerRouter.route('/alarms').put(veryHighRiskLimit, async (req: Request, res: Response) => {
  let reqUid: string | undefined;
  try {
    reqUid = await checkRequest(
      req.get('authorization'),
      req.ip,
      3,
      ['newConfig'],
      req.body,
      req.get('otp-token') || '',
    );
    await ServerService.updateAlarms(req.body.newConfig);
    res.json(buildResponse());
  } catch (e) {
    APIErrorService.save('ServerRouter.put.alarms', e, reqUid, req.ip, req.body);
    res.json(buildResponse(undefined, e));
  }
});





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  ServerRouter,
};
