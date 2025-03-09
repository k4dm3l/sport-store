import { Request, Response, RequestHandler } from 'express';
import { IAuthService } from '@root/services/auth';
import { IResponseService } from '@root/libs/response';

export const handlerSignInFactory = ({
  authService,
  responseService,
}: {
  authService: IAuthService;
  responseService: IResponseService;
}): RequestHandler => async (req: Request, res: Response) => {
  responseService.format({
    response: res,
    status: 200,
    data: await authService.signin(req.body),
  });
};