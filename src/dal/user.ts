import { Db, ObjectId } from 'mongodb';
import { IUser } from '@root/shared/interfaces/user';
import { DBCollections } from '@root/shared/enums/collections';

export interface IUserDAL {
  getUserById: (userId: ObjectId) => Promise<IUser | null>;
  getUserByEmail: (email: string) => Promise<IUser | null>;
  createUser: (user: Partial<IUser>) => Promise<ObjectId>;
}

export const userDALFactory = (mongoDB: Db): IUserDAL => ({
  getUserById: async (userId) => {
    return await mongoDB
      .collection(DBCollections.USERS)
      .findOne<IUser>(
        { _id: userId }
      );
  },
  getUserByEmail: async (email) => {
    return await mongoDB
      .collection(DBCollections.USERS)
      .findOne<IUser>(
        { email }
      );
  },
  createUser: async (user) => {
    const insertResult = await mongoDB
      .collection(DBCollections.USERS)
      .insertOne(user);

    return insertResult.insertedId;
  }
});