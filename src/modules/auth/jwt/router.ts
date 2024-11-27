import { Router, Request, Response } from 'express';
import { buildResponse } from 'api-response-utils';
import { mediumRiskLimit, veryHighRiskLimit } from '../../../middlewares/rate-limit/index.js';
import { checkPublicRequest, checkRequest } from '../../shared/request-guard/index.js';
import { APIErrorService } from '../../api-error/index.js';
import { JWTService } from './index.js';
import { ENVIRONMENT } from '../../shared/environment/index.js';

const JWTRouter = Router();

/* ************************************************************************************************
 *                                           RETRIEVERS                                           *
 ************************************************************************************************ */

/**
 * Validates and lists the refresh token records for an uid.
 * @returns IAPIResponse<IRefreshTokenRecord[]>
 * @requirements
 * - authority: 5
 */
JWTRouter.route('/:uid').get(mediumRiskLimit, async (req: Request, res: Response) => {
  let reqUid: string | undefined;
  try {
    reqUid = await checkRequest(req.get('authorization'), req.ip, 5);
    res.json(buildResponse(await JWTService.listRecords(req.params.uid)));
  } catch (e) {
    APIErrorService.save('JWTRouter.get', e, reqUid, req.ip, req.params);
    res.json(buildResponse(undefined, e));
  }
});





/* ************************************************************************************************
 *                                          AUTH ACTIONS                                          *
 ************************************************************************************************ */

/**
 * Verifies the user's credentials and executes the authentication process. If successful, it
 * sets the Refresh JWT in an HTTP Only Cookie and returns the Access JWT.
 * @param nickname
 * @param password
 * @param otpToken
 * @param altchaPayload
 * @returns IAPIResponse<string>
 */
JWTRouter.route('/sign-in').post(veryHighRiskLimit, async (req: Request, res: Response) => {
  try {
    // validate the request
    checkPublicRequest(req.ip, ['nickname', 'password', 'otpToken', 'altchaPayload'], req.body);

    // generate the tokens
    const { access, refresh } = await JWTService.signIn(
      req.body.nickname,
      req.body.password,
      req.body.otpToken,
      req.body.altchaPayload,
    );

    // set the Refresh JWT in a HTTP-Only Cookie
    res.cookie(JWTService.REFRESH_JWT_COOKIE_NAME, refresh, {
      httpOnly: true,
      secure: ENVIRONMENT.HAS_TUNNEL_TOKEN,
      signed: true,
      maxAge: JWTService.REFRESH_JWT_DURATION_MS,
      sameSite: 'strict',
    });

    // finally, return the access token
    res.json(buildResponse(access));
  } catch (e) {
    APIErrorService.save('JWTRouter.post.sign-in', e, undefined, req.ip, req.body);
    res.json(buildResponse(undefined, e));
  }
});

/**
 * Refreshes an access token based on a long lived Refresh JWT.
 * @returns IAPIResponse<string>
 */
JWTRouter.route('/refresh-jwt').post(mediumRiskLimit, async (req: Request, res: Response) => {
  try {
    checkPublicRequest(req.ip);
    res.json(buildResponse(
      await JWTService.refreshAccessJWT(req.signedCookies[JWTService.REFRESH_JWT_COOKIE_NAME]),
    ));
  } catch (e) {
    APIErrorService.save('JWTRouter.post.refresh-jwt', e, undefined, req.ip);
    res.json(buildResponse(undefined, e));
  }
});

/**
 * Signs an user out from a single or multiple devices in one go.
 * @param allDevices?
 * @returns IAPIResponse<void>
 * @requirements
 * - authority: 1
 */
JWTRouter.route('/sign-out').post(veryHighRiskLimit, async (req: Request, res: Response) => {
  let reqUid: string | undefined;
  try {
    // ensure the user is authenticated
    reqUid = await checkRequest(req.get('authorization'), req.ip, 1);

    // sign the user out
    await JWTService.signOut(
      reqUid,
      req.signedCookies[JWTService.REFRESH_JWT_COOKIE_NAME],
      req.body.allDevices,
    );

    // clear the Refresh JWT Cookie
    res.clearCookie(JWTService.REFRESH_JWT_COOKIE_NAME, {
      httpOnly: true,
      secure: ENVIRONMENT.HAS_TUNNEL_TOKEN,
      signed: true,
    });
    res.json(buildResponse());
  } catch (e) {
    APIErrorService.save('JWTRouter.post.sign-out', e, reqUid, req.ip, req.body);
    res.json(buildResponse(undefined, e));
  }
});





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  JWTRouter,
};
