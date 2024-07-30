import { Router, Request, Response } from 'express';
import { buildResponse } from 'api-response-utils';
import { mediumRiskLimit, veryHighRiskLimit } from '../../../middlewares/rate-limit/index.js';
import { checkPublicRequest, checkRequest } from '../../shared/request-guard/index.js';
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
 * Validates & retrieves the OTP Secret for an ID.
 * @returns IAPIResponse<string>
 * @requirements
 * - authority: 5
 */
UserRouter.route('/:uid/otp-secret').get(mediumRiskLimit, async (req: Request, res: Response) => {
  let reqUid: string | undefined;
  try {
    reqUid = await checkRequest(req.get('authorization'), req.ip, 5);
    res.json(buildResponse(await UserService.getOTPSecret(req.params.uid)));
  } catch (e) {
    APIErrorService.save('UserRouter.get.otp-secret', e, reqUid, req.ip, {
      ...req.params,
      ...req.query,
    });
    res.json(buildResponse(undefined, e));
  }
});

/**
 * Validates and retrieves the list of password update records for a uid.
 * @param startAtEventTime?
 * @returns IAPIResponse<IPasswordUpdate[]>
 * @requirements
 * - authority: 5
 */
UserRouter.route('/:uid/password-updates').get(mediumRiskLimit, async (req: Request, res: Response) => {
  let reqUid: string | undefined;
  try {
    reqUid = await checkRequest(req.get('authorization'), req.ip, 5);
    res.json(buildResponse(await UserService.listUserPasswordUpdates(
      req.params.uid,
      typeof req.query.startAtEventTime === 'string' ? Number(req.query.startAtEventTime) : undefined,
    )));
  } catch (e) {
    APIErrorService.save('UserRouter.get.password-updates', e, reqUid, req.ip, {
      ...req.params,
      ...req.query,
    });
    res.json(buildResponse(undefined, e));
  }
});





/* ************************************************************************************************
 *                                     USER RECORD MANAGEMENT                                     *
 ************************************************************************************************ */

/**
 * Creates a User Record and returns it. Pass the password only when creating the root account.
 * Normal users should set the password by going through the Password Update functionality.
 * @param nickname
 * @param authority
 * @returns IAPIResponse<IUser>
 * @requirements
 * - authority: 5
 * - otp-token
 */
UserRouter.route('/').post(veryHighRiskLimit, async (req: Request, res: Response) => {
  let reqUid: string | undefined;
  try {
    reqUid = await checkRequest(
      req.get('authorization'),
      req.ip,
      5,
      ['nickname', 'authority'],
      req.body,
      req.get('otp-token') || '',
    );
    res.json(buildResponse(await UserService.createUser(req.body.nickname, req.body.authority)));
  } catch (e) {
    APIErrorService.save('UserRouter.post', e, reqUid, req.ip, req.body);
    res.json(buildResponse(undefined, e));
  }
});

/**
 * Validates and updates a nonroot user's nickname.
 * @param newNickname
 * @returns IAPIResponse<void>
 * @requirements
 * - authority: 5
 * - otp-token
 */
UserRouter.route('/:uid/nickname').patch(veryHighRiskLimit, async (req: Request, res: Response) => {
  let reqUid: string | undefined;
  try {
    reqUid = await checkRequest(
      req.get('authorization'),
      req.ip,
      5,
      ['newNickname'],
      req.body,
      req.get('otp-token') || '',
    );
    await UserService.updateNickname(req.params.uid, req.body.newNickname);
    res.json(buildResponse());
  } catch (e) {
    APIErrorService.save('UserRouter.patch.nickname', e, reqUid, req.ip, { ...req.params, ...req.body });
    res.json(buildResponse(undefined, e));
  }
});

/**
 * Validates and updates a nonroot user's authority.
 * @param newAuthority
 * @returns IAPIResponse<void>
 * @requirements
 * - authority: 5
 * - otp-token
 */
UserRouter.route('/:uid/authority').patch(veryHighRiskLimit, async (req: Request, res: Response) => {
  let reqUid: string | undefined;
  try {
    reqUid = await checkRequest(
      req.get('authorization'),
      req.ip,
      5,
      ['newAuthority'],
      req.body,
      req.get('otp-token') || '',
    );
    await UserService.updateAuthority(req.params.uid, req.body.newAuthority);
    res.json(buildResponse());
  } catch (e) {
    APIErrorService.save('UserRouter.patch.authority', e, reqUid, req.ip, { ...req.params, ...req.body });
    res.json(buildResponse(undefined, e));
  }
});

/**
 * Validates and updates a nonroot user's password hash.
 * @param nickname
 * @param newPassword
 * @param otpToken
 * @param altchaPayload
 * @returns IAPIResponse<void>
 */
UserRouter.route('/password').patch(veryHighRiskLimit, async (req: Request, res: Response) => {
  try {
    checkPublicRequest(req.ip, ['nickname', 'newPassword', 'otpToken', 'altchaPayload'], req.body);
    await UserService.updatePasswordHash(
      req.body.nickname,
      req.body.newPassword,
      req.body.otpToken,
      req.body.altchaPayload,
    );
    res.json(buildResponse());
  } catch (e) {
    APIErrorService.save('UserRouter.patch.password', e, undefined, req.ip, req.body);
    res.json(buildResponse(undefined, e));
  }
});

/**
 * Validates and updates a nonroot user's OTP Secret. The new secret is returned on completion.
 * @returns IAPIResponse<string>
 * @requirements
 * - authority: 5
 * - otp-token
 */
UserRouter.route('/:uid/otp-secret').patch(veryHighRiskLimit, async (req: Request, res: Response) => {
  let reqUid: string | undefined;
  try {
    reqUid = await checkRequest(
      req.get('authorization'),
      req.ip,
      5,
      undefined,
      undefined,
      req.get('otp-token') || '',
    );
    res.json(buildResponse(await UserService.updateOTPSecret(req.params.uid)));
  } catch (e) {
    APIErrorService.save('UserRouter.patch.otpSecret', e, reqUid, req.ip, req.params);
    res.json(buildResponse(undefined, e));
  }
});

/**
 * Validates and deletes a nonroot user account.
 * @returns IAPIResponse<void>
 * @requirements
 * - authority: 5
 * - otp-token
 */
UserRouter.route('/:uid').delete(veryHighRiskLimit, async (req: Request, res: Response) => {
  let reqUid: string | undefined;
  try {
    reqUid = await checkRequest(
      req.get('authorization'),
      req.ip,
      5,
      undefined,
      undefined,
      req.get('otp-token') || '',
    );
    await UserService.deleteUser(req.params.uid);
    res.json(buildResponse());
  } catch (e) {
    APIErrorService.save('UserRouter.delete', e, reqUid, req.ip, req.params);
    res.json(buildResponse(undefined, e));
  }
});





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  UserRouter,
};
