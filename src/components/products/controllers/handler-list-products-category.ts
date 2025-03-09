import { Request, Response, RequestHandler } from 'express';
import { IProductService } from '@root/services/products';
import { IResponseService } from '@root/libs/response';

export const handlerListProductsByCategoryControllerFactory = ({
  productsService,
  responseService,
}: {
  productsService: IProductService;
  responseService: IResponseService;
}): RequestHandler => async (req: Request, res: Response) => {
  const { next, previous, products } = await productsService.getProductsByCategory({
    name: req.query.name as string,
    direction: req.query.direction ? req.query.direction as string : undefined,
    limit: Number(req.query.limit || 10),
    reference: req.query.reference ? req.query.reference as string : undefined,
  });

  responseService.format({
    response: res,
    status: 200,
    data: products,
    meta: {
      next: next ? next.toString() : null,
      previous: previous ? previous.toString() : null,
    }
  });
};