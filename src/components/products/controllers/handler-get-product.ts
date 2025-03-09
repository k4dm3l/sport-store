import { Request, Response, RequestHandler } from 'express';
import { IProductService } from '@root/services/products';
import { IResponseService } from '@root/libs/response';

export const handlerGetProductControllerFactory = ({
  productsService,
  responseService,
}: {
  productsService: IProductService;
  responseService: IResponseService;
}): RequestHandler => async (req: Request, res: Response) => {
  responseService.format({
    response: res,
    status: 200,
    data: await productsService.getProductById(req.params.id),
  });
};