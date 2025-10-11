import { Product } from "../models/Product";

export const createProduct = async (name: string, price: number, stock: number) => {
  const product = new Product({ name, price, stock });
  return product.save();
};

export const listProducts = async () => {
  return Product.find();
};
