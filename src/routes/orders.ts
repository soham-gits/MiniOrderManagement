import { Router } from "express";
import * as orderController from "../controller/orderController";

const router = Router();

router.post("/", orderController.addOrder);
router.get("/", orderController.getOrders);

export default router;
