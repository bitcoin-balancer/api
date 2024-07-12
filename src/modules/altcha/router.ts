import { Router, Request, Response } from 'express';
import { highRiskLimit } from '../../middlewares/rate-limit/index.js';
import { AltchaService } from './index.js';

const AltchaRouter = Router();

/* ************************************************************************************************
 *                                         IMPLEMENTATION                                         *
 ************************************************************************************************ */

/**
 * Creates an Altcha Challenge ready to be sent to the client.
 * @returns IChallenge
 */
AltchaRouter.route('/').get(highRiskLimit, async (req: Request, res: Response) => {
  res.json(await AltchaService.create());
});





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  AltchaRouter,
};
