import { Request, Response, RequestHandler } from 'express';
import { IProductService } from '@root/services/products';
import { IResponseService } from '@root/libs/response';

export const handlerListProductsControllerFactory = ({
  productsService,
  responseService,
}: {
  productsService: IProductService;
  responseService: IResponseService;
}): RequestHandler => async (req: Request, res: Response) => {
  
  const {
    next,
    pages,
    previous,
    products,
    total
  } = await productsService.getProducts({
    page: Number(req.query.page),
    limit: Number(req.query.limit),
    searchParam: req.query.search as string,
  });

  responseService.format({
    response: res,
    status: 200,
    data: products,
    meta: {
      next,
      previous,
      page: Number(req.query.page),
      limit: Number(req.query.limit),
      pages,
      total,
    }
  });
};