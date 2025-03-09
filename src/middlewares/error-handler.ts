import boom, { Boom } from '@hapi/boom';
import { Request, Response, NextFunction } from 'express';
import logger from '@root/libs/logger';
import { BusinessError, ForbiddenError, NotFoundError, ServerError } from '@root/shared/errors';
import env from '@root/configs';
import UnauthorizedError from '@root/shared/errors/unauthorized';

export const withErrorStack = (error: any, stack: any) => {
  if (env.ENVIRONMENT !== 'production') {
    return { error, stack };
  }

  return error;
};

export const notFoundErrorHandler = (req: Request, res: Response) => {
  const { output: { statusCode, payload } } = boom.notFound();
  res.status(statusCode).json(payload);
};

export const errorFormatter = (error: any) => {
  let boomError;
  logger.error(error);
  if (error instanceof BusinessError) {
    boomError = boom.badRequest(error.message);
  }

  if (error instanceof NotFoundError) {
    boomError = boom.notFound(error.message);
  }

  if (error instanceof ForbiddenError) {
    boomError = boom.forbidden(error.message);
  }

  if (error instanceof UnauthorizedError) {
    boomError = boom.unauthorized(error.message);
  }

  if (error instanceof ServerError) {
    boomError = boom.internal('internal server error');
  }

  boomError = boom.internal('internal server error');
  return boomError;
};

export const logError = (error: any, req: Request, res: Response, next: NextFunction) => {
  if (error.isBoom) {
    res
      .status(error.output.statusCode)
      .json({
        error: true,
        message: error.output.payload.message,
      });
    return;
  }

  const formatedError = errorFormatter(error);
  logger.error(error.message || 'log-error: error trying to log error');
  
  res
    .status(formatedError.output.statusCode)
    .json({
      error: true,
      message: formatedError.output.payload.message || error.message || 'internal server error',
    });
};