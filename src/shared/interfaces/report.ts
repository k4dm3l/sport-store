import { ObjectId } from 'mongodb';

export interface IReport {
  _id: ObjectId,
  name: string,
  total_pricing: number;
  total_products: number;
  total_stock: number;
  average_price: number;
  top_categories?: string[];
}