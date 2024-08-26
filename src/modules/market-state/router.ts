import { Router, Request, Response } from 'express';
import { buildResponse } from 'api-response-utils';
import { lowRiskLimit, mediumRiskLimit } from '../../middlewares/rate-limit/index.js';
import { checkRequest } from '../shared/request-guard/index.js';
import { APIErrorService } from '../api-error/index.js';
import { WindowService } from './window/index.js';

import { CoinsService, ICoinStateAsset } from './coins/index.js';

const MarketStateRouter = Router();

/* ************************************************************************************************
 *                                             WINDOW                                             *
 ************************************************************************************************ */

/**
 * Retrieves the window module's configuration.
 * @returns IAPIResponse<IWindowConfig>
 * @requirements
 * - authority: 2
 */
MarketStateRouter.route('/window/config').get(lowRiskLimit, async (req: Request, res: Response) => {
  let reqUid: string | undefined;
  try {
    reqUid = await checkRequest(req.get('authorization'), req.ip, 2);
    res.json(buildResponse(WindowService.config));
  } catch (e) {
    APIErrorService.save('MarketStateRouter.get.window.config', e, reqUid, req.ip);
    res.json(buildResponse(undefined, e));
  }
});

/**
 * Updates the window module's configuration.
 * @param newConfig
 * @returns IAPIResponse<void>
 * @requirements
 * - authority: 3
 * - otp-token
 */
MarketStateRouter.route('/window/config').put(mediumRiskLimit, async (req: Request, res: Response) => {
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
    await WindowService.updateConfiguration(req.body.newConfig);
    res.json(buildResponse());
  } catch (e) {
    APIErrorService.save('MarketStateRouter.put.window.config', e, reqUid, req.ip, req.body);
    res.json(buildResponse(undefined, e));
  }
});





/* ************************************************************************************************
 *                                             COINS                                              *
 ************************************************************************************************ */

/**
 * Retrieves the state object for a coin based on an asset.
 * @returns IAPIResponse<ICoinState>
 * @requirements
 * - authority: 1
 */
MarketStateRouter.route('/coins/state/:asset/:symbol').get(lowRiskLimit, async (req: Request, res: Response) => {
  let reqUid: string | undefined;
  try {
    reqUid = await checkRequest(req.get('authorization'), req.ip, 1);
    res.json(buildResponse(CoinsService.getStateForSymbol(
      <ICoinStateAsset>req.params.asset,
      req.params.symbol,
    )));
  } catch (e) {
    APIErrorService.save('MarketStateRouter.get.coins.state.asset.symbol', e, reqUid, req.ip, req.params);
    res.json(buildResponse(undefined, e));
  }
});

/**
 * Retrieves the semi-compact state for an asset.
 * @returns IAPIResponse<ICoinsState<ISemiCompactCoinState>>
 * @requirements
 * - authority: 1
 */
MarketStateRouter.route('/coins/state/:asset').get(lowRiskLimit, async (req: Request, res: Response) => {
  let reqUid: string | undefined;
  try {
    reqUid = await checkRequest(req.get('authorization'), req.ip, 1);
    res.json(buildResponse(CoinsService.getSemiCompactStateForAsset(
      <ICoinStateAsset>req.params.asset,
    )));
  } catch (e) {
    APIErrorService.save('MarketStateRouter.get.coins.state.asset', e, reqUid, req.ip, req.params);
    res.json(buildResponse(undefined, e));
  }
});

/**
 * Retrieves the coins module's configuration.
 * @returns IAPIResponse<ICoinsConfig>
 * @requirements
 * - authority: 2
 */
MarketStateRouter.route('/coins/config').get(lowRiskLimit, async (req: Request, res: Response) => {
  let reqUid: string | undefined;
  try {
    reqUid = await checkRequest(req.get('authorization'), req.ip, 2);
    res.json(buildResponse(CoinsService.config));
  } catch (e) {
    APIErrorService.save('MarketStateRouter.get.coins.config', e, reqUid, req.ip);
    res.json(buildResponse(undefined, e));
  }
});

/**
 * Updates the coins module's configuration.
 * @param newConfig
 * @returns IAPIResponse<void>
 * @requirements
 * - authority: 3
 * - otp-token
 */
MarketStateRouter.route('/coins/config').put(mediumRiskLimit, async (req: Request, res: Response) => {
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
    await WindowService.updateConfiguration(req.body.newConfig);
    res.json(buildResponse());
  } catch (e) {
    APIErrorService.save('MarketStateRouter.put.coins.config', e, reqUid, req.ip, req.body);
    res.json(buildResponse(undefined, e));
  }
});





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  MarketStateRouter,
};
