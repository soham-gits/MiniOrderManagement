import { Router } from "express";
import * as productController from "../controller/productController";

const router = Router();

router.post("/", productController.addProduct);
router.get("/", productController.getProducts);

export default router;
