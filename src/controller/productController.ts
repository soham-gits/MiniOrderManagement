import { Request, Response } from "express";
import { productSchema } from "../validation";
import * as productService from "../services/productService";

export const addProduct = async (req: Request, res: Response) => {
  const { error, value } = productSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const { name, price, stock } = value;
  const product = await productService.createProduct(name, price, stock);
  res.status(201).json(product);
};

export const getProducts = async (_req: Request, res: Response) => {
  const products = await productService.listProducts();
  res.json(products);
};
