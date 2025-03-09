import { MongoClient, ObjectId } from 'mongodb';
import compare from 'just-compare';
import omit from 'just-omit';
import { IProductsDAL } from '@root/dal/products';
import { IProduct } from '@root/shared/interfaces/product';
import { BusinessError, NotFoundError, ServerError } from '@root/shared/errors';
import { IUtils } from '@root/libs/utils';
import { ICache } from '@root/libs/redis-cache';
import { CachePrefix } from '@root/shared/enums/cache-prefix';
import env from '@root/configs'

export interface IProductService {
  createProduct: (product: Partial<IProduct>) => Promise<IProduct>;
  getProductsByCategory: ({
    name,
    limit,
    direction,
    reference,
  }: {
    name: string;
    limit: number;
    direction?: string;
    reference?: string;
  }) => Promise<{
    products: IProduct[];
    next: ObjectId | null;
    previous: ObjectId | null;
  }>;
  getProductById: (productId: string) => Promise<IProduct>;
  getProducts: ({
    limit,
    page,
    searchParam,
  }: {
    limit: number;
    page: number;
    searchParam?: string;
  }) => Promise<{
    products: IProduct[];
    next: number | null;
    previous: number | null;
    total: number;
    pages: number;
  }>;
  updateProduct: (
    productId: string,
    product: Partial<IProduct>
  ) => Promise<IProduct>;
  deleteProduct: (
    productId: string,
  ) => Promise<void>
};

export const productServiceFactory = ({
  productsDAL,
  mongoClient,
  utils,
  redisCache,
}: {
  mongoClient: MongoClient;
  productsDAL: IProductsDAL;
  utils: IUtils;
  redisCache: ICache;
}): IProductService => ({
  createProduct: async (product) => {
    const session = mongoClient.startSession();
    
    try {
      session.startTransaction();
      const newProductId = await productsDAL.createProduct({
        ...product,
        category: product.category?.toUpperCase(),
      }, session);

      if (!newProductId) throw new BusinessError('service: error retrieving new product created');
      const cacheKey = utils.buildCacheKey(CachePrefix.PRODUCT, JSON.stringify(newProductId));

      const newProduct = await productsDAL.getProductById(newProductId, session);
      await redisCache.flush();
      await redisCache.set(cacheKey, newProduct, env.REDIS_TTL);
      
      if (!newProduct) throw new BusinessError('service: error retrieving new product created');
      
      await session.commitTransaction();
      return newProduct;
    } catch (error) {
      await session.abortTransaction();
      throw new ServerError('service: error trying to create new product');
    } finally {
      session.endSession();
    }
  },
  getProductsByCategory: async ({ name, direction, limit, reference }) => {
    const cacheKey = reference && direction
      ? utils.buildCacheKey(CachePrefix.PRODUCT, `${name}-${direction}-${limit}-${reference}`)
      : utils.buildCacheKey(CachePrefix.PRODUCT, `${name}-${limit}`);
    let next, previous;

    const cachedProduct = await redisCache.get(cacheKey);
    if (cachedProduct) {
      return cachedProduct;
    }

    if (direction === 'next') {
      next = reference;
    } else if (direction === 'previous') {
      previous = reference;
    }

    const {
      next: newNext,
      previous: newPrevious,
      products
    } = await productsDAL.getProductsByCategory({
      category: name,
      limit,
      next: next ? new ObjectId(next) : undefined,
      previous: previous ? new ObjectId(previous) : undefined,
    });

    if (!products.length) throw new NotFoundError(`products with category ${name.toUpperCase()} not found`);

    await redisCache.set(cacheKey, {
      products,
      next: newNext,
      previous: newPrevious,
    }, (env.REDIS_TTL / 3));

    return {
      products,
      next: newNext,
      previous: newPrevious,
    };
  },
  getProductById: async (productId) => {
    const cacheKey = utils.buildCacheKey(CachePrefix.PRODUCT, productId);
    const session = mongoClient.startSession();
    
    try {
      const cachedProduct = await redisCache.get(cacheKey);
      if (cachedProduct) {
        return cachedProduct;
      }

      session.startTransaction();
      
      if (!ObjectId.isValid(productId)) throw new BusinessError('service: invalid id');
      const product = await productsDAL.getProductById(new ObjectId(productId), session);

      if (!product) throw new NotFoundError('service: product not found');
      await redisCache.set(cacheKey, product, env.REDIS_TTL);
      
      await session.commitTransaction();
      return product;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  },
  getProducts: async ({ limit, page, searchParam }) => {
    if (!limit || !page) throw new BusinessError('service: limit and page both are required');
    const cacheKey = searchParam 
      ? utils.buildCacheKey(CachePrefix.PRODUCT, `${page}-${limit}-${searchParam}`)
      : utils.buildCacheKey(CachePrefix.PRODUCT, `${page}-${limit}`);

    const cachedProduct = await redisCache.get(cacheKey);
    if (cachedProduct) {
      return cachedProduct;
    }

    const offset = (page - 1) * limit;

    const [ products, total ] = await Promise.all([
      productsDAL.getProducts({
        limit,
        page: offset,
        searchParam: searchParam ?? '',
      }),
      productsDAL.getTotalProduct({ searchParam: searchParam ?? '' }),
    ]);

    const pages = Math.ceil(total / limit);

    await redisCache.set(cacheKey, {
      products,
      next: page === pages || !products.length ? null : page + 1,
      previous: page === 1 || !products.length ? null : page - 1,
      total,
      pages,
    }, (env.REDIS_TTL / 3));

    return {
      products,
      next: page === pages || !products.length ? null : page + 1,
      previous: page === 1 || !products.length ? null : page - 1,
      total,
      pages,
    };
  },
  updateProduct: async (productId, product) => {
    const session = mongoClient.startSession();
    
    try {
      session.startTransaction();
      const objectProductId = new ObjectId(productId);
      const cacheKey = utils.buildCacheKey(CachePrefix.PRODUCT, productId);

      if (!ObjectId.isValid(objectProductId)) throw new BusinessError('service: invalid id');

      const currentProduct = await productsDAL.getProductById(objectProductId, session);
      
      if (!currentProduct) {
        throw new NotFoundError('service: product not found');
      }

      const currentProductWithoutId = omit(currentProduct, '_id');
      const areEqual = compare(currentProductWithoutId, product);

      if (areEqual) {
        return currentProduct;
      }
      
      const updateProductResult = await productsDAL.updateProduct(
        objectProductId,
        {
          ...product,
          category: product.category?.toUpperCase(),
        },
        currentProduct,
        session,
      );

      if (!updateProductResult) {
        await session.commitTransaction();
        return currentProduct;
      }

      const updatedProduct = await productsDAL.getProductById(objectProductId, session);
      if (!updatedProduct) throw new ServerError('service: error retrieving updated product');

      await redisCache.flush();
      await redisCache.set(cacheKey, updatedProduct, env.REDIS_TTL);
      await session.commitTransaction();
      return updatedProduct;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  },
  deleteProduct: async (productId) => {
    const session = mongoClient.startSession();
    
    try {
      session.startTransaction();
      const objectProductId = new ObjectId(productId);
      const cacheKey = utils.buildCacheKey(CachePrefix.PRODUCT, productId);

      if (!ObjectId.isValid(objectProductId)) throw new BusinessError('service: invalid id');
      
      await productsDAL.deleteProduct(objectProductId, session);
      await redisCache.del(cacheKey);

      await session.commitTransaction();
      return;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
});