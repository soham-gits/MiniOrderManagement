import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { addItem, getCart, removeItem } from "../controller/cartController";
import { validateBody } from "../middleware/validate";
import Joi from "joi";

const router = Router();

const addToCartSchema = Joi.object({
  product: Joi.string().required(),
  quantity: Joi.number().integer().min(1).required(),
});

router.post("/add", authenticate, validateBody(addToCartSchema), addItem);
router.get("/", authenticate, getCart);
router.delete("/items/:productId", authenticate, removeItem);

export default router;
