import { Response } from 'express';

interface IPagination {
  page?: number;
  limit?: number;
  total?: number;
  pages?: number;
  previous?: string | number | null;
  next?: string | number | null;
};

interface IResponse {
  status: number;
  data: any;
  meta?: Partial<IPagination>;
}

export interface IResponseService {
  format: ({
    response,
    status,
    data,
    meta,
  }: {
    response: Response;
    status: number;
    data: any;
    meta?: Partial<IPagination>;
  }) => void;
};

export const responseFormatFactory = (): IResponseService => ({
  format: ({ response, status, data, meta, }) => {
    response.status(status)
      .json({
        status,
        data,
        meta,
      });
  },
});