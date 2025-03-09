import { Router, RequestHandler } from 'express';
import passport from 'passport';
import { asyncHandler } from '@root/middlewares/async-handler';
import { schemaValidation } from '@root/middlewares/schema-handler';
import {
  generalReportSchema,
} from '@root/schemas/reports';

export const reportRouterFactory = ({
  handlerGetReportGeneralController,
}: {
  handlerGetReportGeneralController: RequestHandler;
}): Router => {
  const router = Router();

  router.get(
    '/general',
    passport.authenticate('jwt', { session: false }),
    schemaValidation(generalReportSchema, 'query'),
    asyncHandler(handlerGetReportGeneralController),
  )

  return router;
};