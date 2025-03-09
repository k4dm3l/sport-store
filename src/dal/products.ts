import { Db, ObjectId, ClientSession, UpdateResult } from 'mongodb';
import { DBCollections } from '@root/shared/enums/collections';
import { IProduct } from '@root/shared/interfaces/product';
import { Reports } from '@root/shared/enums/reports';
import { NotFoundError, ServerError } from '@root/shared/errors';

export interface IProductsDAL {
  createProduct: (
    product: Partial<IProduct>, 
    session: ClientSession
  ) => Promise<ObjectId>;
  getProductsByCategory: ({
    category,
    limit,
    next,
    previous,
  }: {
    category: string;
    limit?: number;
    next?: ObjectId | undefined;
    previous?: ObjectId | undefined;
  }) => Promise<{
    products: IProduct[];
    next: ObjectId | null;
    previous: ObjectId | null;
  }>;
  getProductById: (productId: ObjectId, session: ClientSession) => Promise<IProduct | null>;
  getProducts: ({
    searchParam,
    page,
    limit,
  }: {
    searchParam: string;
    page: number;
    limit: number;
  }) => Promise<IProduct[]>
  updateProduct: (
    productId: ObjectId,
    product: Partial<IProduct>,
    currentProduct: IProduct,
    session: ClientSession
  ) => Promise<UpdateResult | Partial<IProduct> | null | undefined>
  deleteProduct: (
    productId: ObjectId, 
    session: ClientSession
  ) => Promise<boolean>;
  getTotalProduct: ({
    searchParam,
  }: {
    searchParam: string;
  }) => Promise<number>
};

export const productsDALFactory = (mongoDB: Db): IProductsDAL => ({
  createProduct: async (product, session) => {
    const insertResult = await mongoDB
      .collection(DBCollections.PRODUCTS)
      .insertOne({ ...product, category: product.category?.toUpperCase() }, { session });

    if (!insertResult.insertedId) {
      await session.abortTransaction();
      throw new ServerError('dal: not able to create new product');
    }

    await mongoDB
      .collection(DBCollections.REPORTS)
      .updateOne(
        { name: Reports.GENERAL },
        {
          $inc: {
            total_products: 1,
            total_stock: product.stock || 0,
            total_pricing: product.price,
          }
        },
        { session, upsert: true }
      );

    await mongoDB
      .collection(DBCollections.CATEGORIES)
      .updateOne(
        { name: product.category },
        { $inc: { count: 1 } },
        { session, upsert: true }
      );

    return insertResult.insertedId;
  },
  getProductsByCategory: async ({ category, limit, next, previous }) => {
    const limitValue = limit || 10;
    const query: Record<string, any> = { category: category.toUpperCase() };
    const sortQuery: Record<string, any> = { _id: 1 };
    let isForward = true;

    if (next) {
      query._id = { $gt: next };
    } else if (previous) {
      query._id = { $lt: previous };
      sortQuery._id = -1;
      isForward = false;
    }

    const products = await mongoDB
      .collection(DBCollections.PRODUCTS)
      .find<IProduct>(query)
      .sort(sortQuery)
      .limit(limitValue + 1)
      .toArray();

    const hasExtra = products.length > limitValue;
    let records = hasExtra ? products.slice(0, limitValue) : products;

    if (!isForward) {
      records = records.reverse();
    }

    let newNext = null;
    let newPrevious = null;

    if (isForward) {
      newNext = hasExtra ? records[records.length - 1]._id : null;
      newPrevious = next ? records[0]._id : null;
    } else {
      newNext = records.length ? records[records.length - 1]._id : null;
      newPrevious = hasExtra ? records[0]._id : null;
    }

    return {
      products: records,
      next: newNext,
      previous: newPrevious,
    };
  },
  getProductById: async (productId, session) => {
    return await mongoDB
      .collection(DBCollections.PRODUCTS)
      .findOne<IProduct>(
        { _id: productId },
        { session }
      );
  },
  getProducts: async ({ searchParam, page, limit }) => {
    return await mongoDB
      .collection(DBCollections.PRODUCTS)
      .find<IProduct>({
        name: { $regex: searchParam, $options: 'i' }
      })
      .skip(page)
      .limit(limit)
      .toArray();
  },
  updateProduct: async (productId, product, currentProduct, session) => {
    let retries = 3;
    while (retries > 0) {
      const currentProductStock = currentProduct?.stock || 0;
      const currentProductPrice = currentProduct?.price || 0;
      const diffStock = product.stock! - currentProductStock;
      const diffPricing = product.price! - currentProductPrice;

      const updatedProduct = await mongoDB
        .collection(DBCollections.PRODUCTS)
        .updateOne(
          { _id: productId },
          { $set: { ...product, category: product.category?.toUpperCase() } },
          { session }
        );

      if (updatedProduct.modifiedCount === 0) {
        if (retries <= 0) {
          throw new ServerError('service: unnable to update record');
        }
        retries--;
        continue;
      }

      if (
        product.category &&
        currentProduct?.category && 
        (product.category !== currentProduct.category)
      ) {
        await mongoDB
          .collection(DBCollections.CATEGORIES)
          .updateOne(
            { name: currentProduct.category },
            { $inc: { count: -1 } },
            { session, upsert: true }
          );

        await mongoDB
          .collection(DBCollections.CATEGORIES)
          .updateOne(
            { name: product.category },
            { $inc: { count: 1 } },
            { session, upsert: true }
          );
      }

      await mongoDB
        .collection(DBCollections.REPORTS)
        .updateOne(
          { name: Reports.GENERAL },
          {
            $inc: {
              total_stock: diffStock || 0,
              total_pricing: diffPricing || 0,
            }
          },
          { session, upsert: true }
        );

      return updatedProduct;
    }
  },
  deleteProduct: async (productId, session) => {
    const productDeleted = await mongoDB
      .collection(DBCollections.PRODUCTS)
      .findOneAndDelete(
        { _id: productId },
        { session },
      );

    if (!productDeleted) {
      await session.abortTransaction();
      throw new ServerError('dal: not able to delete product');
    }

    await mongoDB
      .collection(DBCollections.REPORTS)
      .updateOne(
        { name: Reports.GENERAL },
        {
          $inc: {
            total_products: -1,
            total_stock: -productDeleted.stock || 0,
            total_pricing: -productDeleted.price || 0,
          }
        },
        { session }
      );

    await mongoDB
      .collection(DBCollections.CATEGORIES)
      .updateOne(
        { name: productDeleted.category },
        { $inc: { count: -1 } },
        { session }
      );
      
    return true;
  },
  getTotalProduct: async ({ searchParam }) => {
    return await mongoDB
      .collection(DBCollections.PRODUCTS)
      .countDocuments({
        name: { $regex: searchParam, $options: 'i' }
      });
  }
});