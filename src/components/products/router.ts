import { Router, RequestHandler } from 'express';
import passport from 'passport';
import { asyncHandler } from '@root/middlewares/async-handler';
import { schemaValidation } from '@root/middlewares/schema-handler';

import {
  getProductByCategorySchema,
  productByIdSchema,
  getProductsSchema,
  productSchema,
} from '@root/schemas/products';

export const productRouterFactory = ({
  handlerCreateProductController,
  handlerDeleteProductController,
  handlerGetProductController,
  handlerListProductsByCategoryController,
  handlerListProductsController,
  handlerUpdateProductController,
}: {
  handlerCreateProductController: RequestHandler;
  handlerDeleteProductController: RequestHandler;
  handlerGetProductController: RequestHandler;
  handlerListProductsByCategoryController: RequestHandler;
  handlerListProductsController: RequestHandler;
  handlerUpdateProductController: RequestHandler;
}): Router => {
  const router = Router();

  router.post(
    '/',
    passport.authenticate('jwt', { session: false }),
    schemaValidation(productSchema),
    asyncHandler(handlerCreateProductController),
  );

  router.get(
    '/:id/details',
    passport.authenticate('jwt', { session: false }),
    schemaValidation(productByIdSchema, 'params'),
    asyncHandler(handlerGetProductController),
  );

  router.get(
    '/category',
    passport.authenticate('jwt', { session: false }),
    schemaValidation(getProductByCategorySchema, 'query'),
    asyncHandler(handlerListProductsByCategoryController),
  );

  router.get(
    '/',
    passport.authenticate('jwt', { session: false }),
    schemaValidation(getProductsSchema, 'query'),
    asyncHandler(handlerListProductsController),
  );

  router.put(
    '/:id',
    passport.authenticate('jwt', { session: false }),
    schemaValidation(productByIdSchema, 'params'),
    schemaValidation(productSchema),
    asyncHandler(handlerUpdateProductController),
  );

  router.delete(
    '/:id',
    passport.authenticate('jwt', { session: false }),
    schemaValidation(productByIdSchema, 'params'),
    asyncHandler(handlerDeleteProductController),
  );

  return router;
};