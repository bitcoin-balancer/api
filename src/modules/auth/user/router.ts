import { Router, Request, Response } from 'express';
import { buildResponse } from 'api-response-utils';
import { mediumRiskLimit, veryHighRiskLimit } from '../../../middlewares/rate-limit/index.js';
import { checkRequest } from '../../shared/request-guard/index.js';
import { APIErrorService } from '../../api-error/index.js';
import { UserService } from './index.js';

const UserRouter = Router();

/* ************************************************************************************************
 *                                           RETRIEVERS                                           *
 ************************************************************************************************ */

/**
 * Retrieves the list of existing user records ordered by authority descendingly.
 * @returns IAPIResponse<IUser[]>
 * @requirements
 * - authority: 5
 */
UserRouter.route('/').get(mediumRiskLimit, async (req: Request, res: Response) => {
  let reqUid: string | undefined;
  try {
    reqUid = await checkRequest(req.get('authorization'), req.ip, 5);
    res.json(buildResponse(UserService.listUsers()));
  } catch (e) {
    APIErrorService.save('UserRouter.get', e, reqUid, req.ip);
    res.json(buildResponse(undefined, e));
  }
});

/**
 * Validates and retrieves the list of password update records for a uid.
 * @param uid
 * @param startAtEventTime?
 * @returns IAPIResponse<IPasswordUpdate[]>
 * @requirements
 * - authority: 5
 */
UserRouter.route('/password-updates').get(mediumRiskLimit, async (req: Request, res: Response) => {
  let reqUid: string | undefined;
  try {
    reqUid = await checkRequest(req.get('authorization'), req.ip, 3, ['uid'], req.query);
    res.json(buildResponse(await UserService.listUserPasswordUpdates(
      <string>req.query.uid,
      typeof req.query.startAtEventTime === 'string' ? Number(req.query.startAtEventTime) : undefined,
    )));
  } catch (e) {
    APIErrorService.save('UserRouter.get.password-updates', e, reqUid, req.ip, req.query);
    res.json(buildResponse(undefined, e));
  }
});





/* ************************************************************************************************
 *                                     USER RECORD MANAGEMENT                                     *
 ************************************************************************************************ */
/**
 * Deletes all the API Errors from the Database.
 * @returns IAPIResponse<void>
 * @requirements
 * - authority: 3
 * - otp-token
 */
UserRouter.route('/').delete(veryHighRiskLimit, async (req: Request, res: Response) => {
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
    APIErrorService.save('APIErrorRouter.delete', e, reqUid, req.ip);
    res.json(buildResponse(undefined, e));
  }
});





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  UserRouter,
};
