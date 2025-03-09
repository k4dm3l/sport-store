import { Request, Response, RequestHandler } from 'express';
import { IReportService } from '@root/services/reports';
import { IResponseService } from '@root/libs/response';

export const handlerGetReportGeneralControllerFactory = ({
  reportsService,
  responseService,
}: {
  reportsService: IReportService;
  responseService: IResponseService;
}): RequestHandler => async (req: Request, res: Response) => {
  responseService.format({
    response: res,
    status: 200,
    data: await reportsService.getMetrics(Number(req.query.topCategories)),
  });
};