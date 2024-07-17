import { Router, Request, Response } from 'express';
import { buildResponse } from 'api-response-utils';
import {
  veryLowRiskLimit,
  mediumRiskLimit,
  veryHighRiskLimit,
} from '../../middlewares/rate-limit/index.js';
import { checkRequest } from '../shared/request-guard/index.js';
import { APIErrorService } from '../api-error/index.js';
import { IPBlacklistService } from './index.js';

const IPBlacklistRouter = Router();

/* ************************************************************************************************
 *                                         IMPLEMENTATION                                         *
 ************************************************************************************************ */

/**
 * Retrieves a list of IP Blacklist Records from the database. A custom starting point can be
 * provided in order to paginate through the records.
 * @param startAtID?
 * @returns IAPIResponse<IIPBlacklistRecord[]>
 * @requirements
 * - authority: 3
 */
IPBlacklistRouter.route('/').get(mediumRiskLimit, async (req: Request, res: Response) => {
  let reqUid: string | undefined;
  try {
    reqUid = await checkRequest(req.get('authorization'), req.ip, 3);
    res.json(buildResponse(await IPBlacklistService.list(
      typeof req.query.startAtID === 'string' ? Number(req.query.startAtID) : undefined,
    )));
  } catch (e) {
    APIErrorService.save('IPBlacklistRouter.get', e, reqUid, req.ip, req.query);
    res.json(buildResponse(undefined, e));
  }
});

/**
 * Registers an IP Address in the Blacklist. Once registered, the API won't serve future requests
 * sent by the IP.
 * @param ip
 * @param notes?
 * @returns IAPIResponse<IIPBlacklistRecord>
 * @requirements
 * - authority: 3
 * - otp-token
 */
IPBlacklistRouter.route('/').post(veryLowRiskLimit, async (req: Request, res: Response) => {
  let reqUid: string | undefined;
  try {
    reqUid = await checkRequest(
      req.get('authorization'),
      req.ip,
      3,
      ['ip'],
      req.body,
      req.get('otp-token') || '',
    );
    res.json(buildResponse(await IPBlacklistService.registerIP(req.body.ip, req.body.notes)));
  } catch (e) {
    APIErrorService.save('IPBlacklistRouter.post', e, reqUid, req.ip, req.body);
    res.json(buildResponse(undefined, e));
  }
});

/**
 * Updates an IP Blacklist Registration Record.
 * @param id
 * @param ip
 * @param notes?
 * @returns IAPIResponse<void>
 * @requirements
 * - authority: 3
 * - otp-token
 */
IPBlacklistRouter.route('/').put(veryHighRiskLimit, async (req: Request, res: Response) => {
  let reqUid: string | undefined;
  try {
    reqUid = await checkRequest(
      req.get('authorization'),
      req.ip,
      3,
      ['id', 'ip'],
      req.body,
      req.get('otp-token') || '',
    );
    await IPBlacklistService.updateIPRegistration(req.body.id, req.body.ip, req.body.notes);
    res.json(buildResponse());
  } catch (e) {
    APIErrorService.save('IPBlacklistRouter.put', e, reqUid, req.ip, req.body);
    res.json(buildResponse(undefined, e));
  }
});

/**
 * Unregisters an IP Address from the Blacklist.
 * @param id
 * @returns IAPIResponse<void>
 * @requirements
 * - authority: 3
 * - otp-token
 */
IPBlacklistRouter.route('/').delete(veryHighRiskLimit, async (req: Request, res: Response) => {
  let reqUid: string | undefined;
  try {
    reqUid = await checkRequest(
      req.get('authorization'),
      req.ip,
      3,
      ['id'],
      req.body,
      req.get('otp-token') || '',
    );
    await IPBlacklistService.unregisterIP(req.body.id);
    res.json(buildResponse());
  } catch (e) {
    APIErrorService.save('IPBlacklistRouter.delete', e, reqUid, req.ip, req.body);
    res.json(buildResponse(undefined, e));
  }
});





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  IPBlacklistRouter,
};
