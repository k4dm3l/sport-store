import { ObjectId } from 'mongodb';

export interface IProduct {
  _id: ObjectId;
  name: string;
  category: string;
  price: number;
  stock: number;
  brand: string;
};