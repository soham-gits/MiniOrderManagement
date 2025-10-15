import { Router } from "express";
import * as productController from "../controller/productController";
import { validateBody, productSchema } from "../middleware/validate";
import { authenticate, authorize } from "../middleware/auth"; // admin auth

const router = Router();

// POST /products - Admin
router.post("/", authenticate, authorize(["ADMIN"]), validateBody(productSchema), productController.addProduct);

// PUT /products/:id - Admin
router.put("/:id", authenticate, authorize(["ADMIN"]), validateBody(productSchema), productController.updateProduct);

// DELETE /products/:id - Admin
router.delete("/:id", authenticate, authorize(["ADMIN"]), productController.deleteProduct);

// GET /products - Public
router.get("/", productController.getProducts);

export default router;
