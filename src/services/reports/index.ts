import { ICategoriesDAL } from "@root/dal/categories";
import { IReportsDAL } from '@root/dal/reports';
import { BusinessError } from "@root/shared/errors";
import { IReport } from "@root/shared/interfaces/report";

export interface IReportService {
  getMetrics: (topCategories: number) => Promise<IReport>
}

export const reportsServiceFactory = ({
  categoriesDAL,
  reportsDAL,
}: {
  categoriesDAL: ICategoriesDAL;
  reportsDAL: IReportsDAL;
}): IReportService => ({
  getMetrics: async (topCategories) => {
    const [ report, categories ] = await Promise.all([
      reportsDAL.getMetrics(),
      categoriesDAL.getTopCategories(topCategories),
    ]);

    if (!report) throw new BusinessError('service: report not found');
    report.top_categories = categories.map(cat => cat.name);
    report.total_pricing = Number(report.total_pricing.toFixed(2));
    report.average_price = Number((report.total_pricing / report.total_products).toFixed(2));

    return report;
  },
});