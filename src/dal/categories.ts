import { DBCollections } from "@root/shared/enums/collections";
import { ICategory } from "@root/shared/interfaces/category";
import { Db } from "mongodb";

export interface ICategoriesDAL {
  getTopCategories: (topNumber: number) => Promise<ICategory[]>
}

export const categoriesDALFactory = (mongoDB: Db): ICategoriesDAL => ({
  getTopCategories: async (topNumber) => {
    return await mongoDB
      .collection(DBCollections.CATEGORIES)
      .find<ICategory>({})
      .sort({ count: -1 })
      .limit(topNumber)
      .toArray()
  },
});