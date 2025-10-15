import { Router } from "express";
import Product from "../models/Product";
import Joi from "joi";
import { validateBody } from "../middleware/validate";
import { listAllOrders, updateOrderStatus } from "../controller/adminController";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();

// Apply admin authentication to all routes
router.use(authenticate);
router.use(authorize(["ADMIN"]));

const productSchema = Joi.object({
  name: Joi.string().required(),
  price: Joi.number().positive().required(),
  stock: Joi.number().integer().min(0).required(),
});

// Add product
router.post("/products", validateBody(productSchema), async (req, res) => {
  const { name, price, stock } = req.body;
  const product = await Product.create({ name, price, stock });
  res.json(product);
});

// List products
router.get("/products", async (req, res) => {
  const products = await Product.find();
  res.json(products);
});

// List all orders
router.get("/orders", listAllOrders);

// Update order status
router.patch("/orders/:id/status", updateOrderStatus);

export default router;
