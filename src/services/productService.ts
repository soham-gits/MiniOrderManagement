import mongoose from "mongoose";
import Product, { IProduct } from "../models/Product";

// Create a new product
export const createProduct = async (name: string, price: number, stock: number): Promise<IProduct> => {
  const product = new Product({ name, price, stock });
  return product.save();
};

// List all products
interface ListProductsOptions {
  page?: number;
  limit?: number;
  sort?: string; // 'price' or 'name'
  order?: 'asc' | 'desc';
  filter?: string; // name filter
}

export const listProducts = async (options: ListProductsOptions = {}): Promise<any> => {
  const page = options.page || 1;
  const limit = options.limit || 10;
  const sortField = options.sort || 'name';
  const sortOrder = options.order === 'desc' ? -1 : 1;
  const filter = options.filter ? { name: { $regex: options.filter, $options: 'i' } } : {};

  const total = await Product.countDocuments(filter);
  const products = await Product.find(filter)
    .sort({ [sortField]: sortOrder })
    .skip((page - 1) * limit)
    .limit(limit);

  return {
    products,
    total,
    page,
    pages: Math.ceil(total / limit),
  };
};


export const updateProduct = async (
  productId: string,
  data: Partial<Pick<IProduct, "name" | "price" | "stock" | "description">>
) => {
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new Error("Invalid product ID");
  }

  const updated = await Product.findByIdAndUpdate(productId, data, { new: true });
  if (!updated) throw new Error("Product not found");

  return updated;
};

// Delete product
export const deleteProduct = async (productId: string) => {
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new Error("Invalid product ID");
  }

  const deleted = await Product.findByIdAndDelete(productId);
  if (!deleted) throw new Error("Product not found");

  return deleted;
};