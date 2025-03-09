import { Db } from "mongodb";
import { IReport } from "@root/shared/interfaces/report";
import { DBCollections } from "@root/shared/enums/collections";

export interface IReportsDAL {
  getMetrics: () => Promise<IReport | null>;
};

export const reportsDALFactory = (mongoDB: Db): IReportsDAL => ({
  getMetrics: async () => {
    return await mongoDB
      .collection(DBCollections.REPORTS)
      .findOne<IReport>(
        { name: 'GENERAL' }
      );
  },
});
