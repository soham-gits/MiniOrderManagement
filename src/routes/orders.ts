import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { checkout as checkoutService } from "../services/orderService";
import { getOrderById, listUserOrders, payOrder } from "../controller/orderController";
import { validateQuery, listOrdersQuerySchema } from "../middleware/validate";

const router = Router();

// Checkout
router.post("/checkout", authenticate, async (req: any, res) => {
  try {
    const order = await checkoutService(req.user._id);
    return res.json(order);
  } catch (err: any) {
    return res.status(400).json({ message: err.message });
  }
});

// Pay order
router.post("/:id/pay", authenticate, payOrder);

// List orders with pagination/filter/sort
router.get("/", authenticate, validateQuery(listOrdersQuerySchema), listUserOrders);

// Get single order
router.get("/:id", authenticate, getOrderById);

export default router;
