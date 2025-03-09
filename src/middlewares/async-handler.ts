import { Request, Response, NextFunction, RequestHandler } from 'express';
import { errorFormatter } from '@root/middlewares/error-handler';

export const asyncHandler = (
  fn: RequestHandler
) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next))
    .catch(error => next(errorFormatter(error)));
};