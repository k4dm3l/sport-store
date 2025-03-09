import { Application } from 'express';
import { Logger } from 'winston';
import { MongoClient, ServerApiVersion } from 'mongodb';
import passport from 'passport';
import env from '@root/configs';
import { IUtils } from '@root/libs/utils';
import { notFoundErrorHandler, logError } from '@root/middlewares/error-handler';
import { productsDALFactory } from '@root/dal/products';
import { userDALFactory } from '@root/dal/user';
import { jwtStrategyFactory } from '@root/middlewares/strategies/jwt';
import { productServiceFactory } from '@root/services/products';
import { responseFormatFactory } from '@root/libs/response';
import { handlerCreateProductControllerFactory } from '@root/components/products/controllers/handler-create-product';
import { handlerDeleteProductControllerFactory } from '@root/components/products/controllers/handler-delete-product';
import { handlerGetProductControllerFactory } from '@root/components/products/controllers/handler-get-product';
import { handlerListProductsByCategoryControllerFactory } from '@root/components/products/controllers/handler-list-products-category';
import { handlerListProductsControllerFactory } from '@root/components/products/controllers/handler-list-products';
import { handlerUpdateProductControllerFactory } from '@root/components/products/controllers/handler-update-product';
import { productRouterFactory } from '@root/components/products/router';
import { reportRouterFactory } from '@root/components/reports/router';
import { reportsDALFactory } from '@root/dal/reports';
import { categoriesDALFactory } from '@root/dal/categories';
import { reportsServiceFactory } from '@root/services/reports';
import { authServiceFactory } from '@root/services/auth';
import { handlerGetReportGeneralControllerFactory } from '@root/components/reports/controllers/handler-get-general';
import { handlerSignInControllerFactory } from '@root/components/auth/controllers/handler-sign-in';
import { authRouterFactory } from './components/auth/router';
import { swaggerRouter } from '@root/docs/swagger-ui';

export const server = async ({
  app,
  logger,
  utils,
}: {
  app: Application;
  logger: Logger;
  utils: IUtils
}): Promise<void> => {
  try {
    const port = utils.normalizeNumber(env.PORT);

    if (!port) throw new Error('wrong port value');

    const mongoClient = new MongoClient(env.MONGO_DB_URI, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      }
    });
    
    await mongoClient.connect();
    const mongoDB = mongoClient.db(env.MONGO_DB_NAME);

    logger.info(`server: connection to db ${mongoDB.databaseName}`);

    // Utils
    const responseService = responseFormatFactory();

    // DAL inits
    const productsDAL = productsDALFactory(mongoDB);
    const usersDAL = userDALFactory(mongoDB);
    const reportsDAL = reportsDALFactory(mongoDB);
    const categoriesDAL = categoriesDALFactory(mongoDB);

    // Services inits
    const productsService = productServiceFactory({ productsDAL, mongoClient });
    const reportsService = reportsServiceFactory({ categoriesDAL, reportsDAL });
    const authService = authServiceFactory({ usersDAL });

    // Handler inits
    const handlerCreateProductController = handlerCreateProductControllerFactory({
      productsService,
      responseService,
    });

    const handlerDeleteProductController = handlerDeleteProductControllerFactory({
      productsService,
      responseService,
    });

    const handlerGetProductController = handlerGetProductControllerFactory({
      productsService,
      responseService,
    });

    const handlerListProductsByCategoryController = handlerListProductsByCategoryControllerFactory({
      productsService,
      responseService,
    });

    const handlerListProductsController = handlerListProductsControllerFactory({
      productsService,
      responseService,
    });

    const handlerUpdateProductController = handlerUpdateProductControllerFactory({
      productsService,
      responseService,
    });

    const handlerGetReportGeneralController = handlerGetReportGeneralControllerFactory({
      reportsService,
      responseService,
    });

    const handlerSignInController = handlerSignInControllerFactory({
      authService,
      responseService,
    });

    // Strategy
    const jwtStrategy = jwtStrategyFactory(usersDAL);

    // middlewares
    passport.use(jwtStrategy);

    // Routes
    const productRouter = productRouterFactory({
      handlerCreateProductController,
      handlerDeleteProductController,
      handlerGetProductController,
      handlerListProductsByCategoryController,
      handlerListProductsController,
      handlerUpdateProductController,
    });

    const reportRouter = reportRouterFactory({
      handlerGetReportGeneralController,
    });

    const authRouter = authRouterFactory({
      handlerSignInController,
    });

    app.use(swaggerRouter);

    app.use(`/api/${env.API_VERSION}/products`, productRouter);
    app.use(`/api/${env.API_VERSION}/reports`, reportRouter);
    app.use(`/api/${env.API_VERSION}/auth`, authRouter);

    app.use(notFoundErrorHandler);
    app.use(logError);

    app.listen(port, () => {
      logger.info(`server: running on port ${env.PORT}`);
    });
  } catch (error) {
    logger.error(`server: ${error}`);
    
    process.on('uncaughtException', process.exit(1));
    process.on('unhandledRejection', process.exit(1));
  }
};
