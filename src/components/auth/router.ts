import { Router, RequestHandler } from 'express';
import passport from 'passport';
import { asyncHandler } from '@root/middlewares/async-handler';
import { schemaValidation } from '@root/middlewares/schema-handler';
import { signInSchema } from '@root/schemas/auth';

export const authRouterFactory = ({
  handlerSignInController,
}: {
  handlerSignInController: RequestHandler;
}): Router => {
  const router = Router();

  router.post(
    '/signin',
    schemaValidation(signInSchema),
    asyncHandler(handlerSignInController),
  );

  return router;
};