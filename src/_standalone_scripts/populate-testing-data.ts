import { faker } from '@faker-js/faker';
import bcrypt from 'bcrypt';
import { MongoClient } from 'mongodb';
import env from '@root/configs';
import { productsDALFactory } from '@root/dal/products';
import { IProduct } from '@root/shared/interfaces/product';
import { ForbiddenError } from '@root/shared/errors';
import { DBCollections } from '@root/shared/enums/collections';
import logger from '@root/libs/logger';
import { userDALFactory } from '@root/dal/user';

const BATCH_SIZE = 10;
const TOTAL_PRODUCTS = 100;

const CATEGORIES = [
  'Fútbol', 'Baloncesto', 'Tenis', 
  'Natación', 'Ciclismo', 'Fitness'
];

const BRANDS = [
  'Nike', 'Adidas', 'Puma', 
  'Under Armour', 'Reebok', 'Asics'
];

const USERS = [
  { name: 'camilo', email: 'camilo@test.com', password: 'Password123*' },
  { name: 'testqa', email: 'testqa@test.com', password: 'Password123*' },
];

const generateFakeProduct = (categories: string[], brands: string[]): Omit<IProduct, '_id'> => ({
  name: `${faker.commerce.productAdjective()} ${faker.commerce.productName()}`,
  category: faker.string.fromCharacters(categories).toUpperCase(),
  price: parseFloat(faker.commerce.price({ min: 10, max: 300 })),
  stock: faker.number.int({ min: 0, max: 1000 }),
  brand: faker.string.fromCharacters(brands),
});

(async () => {
  try {
    if (env.ENVIRONMENT === 'production') throw new ForbiddenError('This operation is not able on production env');

    const client = await MongoClient.connect(env.MONGO_DB_URI);
    const mongoDB = client.db(env.MONGO_DB_NAME);
    const productsDAL = productsDALFactory(mongoDB);
    const userDAL = userDALFactory(mongoDB);

    logger.info('🛠  Restoring database collections');

    await Promise.all([
      mongoDB.dropCollection(DBCollections.PRODUCTS).catch(() => {}),
      mongoDB.dropCollection(DBCollections.CATEGORIES).catch(() => {}),
      mongoDB.dropCollection(DBCollections.REPORTS).catch(() => {}),
      mongoDB.dropCollection(DBCollections.USERS).catch(() => {})
    ]);

    logger.info('🎉 Database restored succesfully! \n');
    
    logger.info('🏃‍♂️  Starting products population...');

    // Generar datos en lotes
    for (let i = 0; i < TOTAL_PRODUCTS; i += BATCH_SIZE) {
      const batchSize = Math.min(BATCH_SIZE, TOTAL_PRODUCTS - i);
      const session = client.startSession();
      
      await session.withTransaction(async () => {
        const products = Array.from({ length: batchSize }, () => 
          generateFakeProduct(CATEGORIES, BRANDS)
        );

        for (const product of products) {
          await productsDAL.createProduct(product, session);
        }
      });

      session.endSession();
      logger.info(`✅ Batch ${i / BATCH_SIZE + 1}: created (${i + batchSize}/${TOTAL_PRODUCTS}) products`);
    }

    logger.info('⚙️  Starting test user population...\n');

    for (const user of USERS) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      await userDAL.createUser({ ...user, password: hashedPassword });
      logger.info(`✅ user ${user.email} created`);
    }

    logger.info('🎉 Database populated succesfully!\n');
    await client.close();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
})();