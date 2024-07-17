import { Router, Request, Response } from 'express';
import { buildResponse } from 'api-response-utils';
import { mediumRiskLimit, veryHighRiskLimit } from '../../middlewares/rate-limit/index.js';
import { checkRequest } from '../shared/request-guard/index.js';
import { APIErrorService } from '../api-error/index.js';

const APIErrorRouter = Router();

/* ************************************************************************************************
 *                                         IMPLEMENTATION                                         *
 ************************************************************************************************ */

/**
 * Retrieves a series of API Errors. If the startAtID is provided, it will start at that point
 * exclusively.
 * @param startAtID?
 * @returns IAPIResponse<IAPIError[]>
 * @requirements
 * - authority: 3
 */
APIErrorRouter.route('/').get(mediumRiskLimit, async (req: Request, res: Response) => {
  let reqUid: string | undefined;
  try {
    reqUid = await checkRequest(req.get('authorization'), req.ip, 3);
    res.json(buildResponse(await APIErrorService.list(
      typeof req.query.startAtID === 'string' ? Number(req.query.startAtID) : undefined,
    )));
  } catch (e) {
    APIErrorService.save('APIErrorRouter.get', e, reqUid, req.ip, req.query);
    res.json(buildResponse(undefined, e));
  }
});

/**
 * Deletes all the API Errors from the Database.
 * @returns IAPIResponse<void>
 * @requirements
 * - authority: 3
 * - otp-token
 */
APIErrorRouter.route('/').delete(veryHighRiskLimit, async (req: Request, res: Response) => {
  let reqUid: string | undefined;
  try {
    reqUid = await checkRequest(
      req.get('authorization'),
      req.ip,
      3,
      undefined,
      undefined,
      req.get('otp-token') || '',
    );
    await APIErrorService.deleteAll();
    res.json(buildResponse());
  } catch (e) {
    APIErrorService.save('APIErrorRouter.delete', e, reqUid, req.ip, req.query);
    res.json(buildResponse(undefined, e));
  }
});





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  APIErrorRouter,
};
