import { Request, Response } from "express";
import * as productService from "../services/productService";
import Product from "../models/Product";

// Add a new product
export const addProduct = async (req: Request, res: Response) => {
  try {
    const { name, price, stock } = req.body; // validated by middleware
    const product = await productService.createProduct(name, price, stock);
    res.status(201).json(product);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

// Get all products
export const getProducts = async (req: Request, res: Response) => {
  try {
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    const sortField = req.query.sort ? String(req.query.sort) : "name";
    const sortOrder = req.query.order === "desc" ? -1 : 1;
    const filter = req.query.filter
      ? { name: { $regex: String(req.query.filter), $options: "i" } }
      : {};

    const total = await Product.countDocuments(filter);
    const products = await Product.find(filter)
      .sort({ [sortField]: sortOrder })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      products,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};



export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = req.body; // validated by middleware
    const updated = await productService.updateProduct(id, data);
    res.json({ message: "Product updated", product: updated });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

// Delete product (Admin)
export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await productService.deleteProduct(id);
    res.json({ message: "Product deleted successfully" });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};