import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth";
import { checkout as checkoutService } from "../services/orderService";
import { getOrderById, listUserOrders, payOrder } from "../controller/orderController";
import { validateQuery, listOrdersQuerySchema } from "../middleware/validate";

const router = Router();

// Checkout (USER only)
router.post("/checkout", authenticate, authorize(["USER"]), async (req: any, res) => {
  try {
    const order = await checkoutService(req.user._id);
    return res.json(order);
  } catch (err: any) {
    return res.status(400).json({ message: err.message });
  }
});

// Pay order (USER only)
router.post("/:id/pay", authenticate, authorize(["USER"]), payOrder);

// List orders (USER only)
router.get("/", authenticate, authorize(["USER"]), validateQuery(listOrdersQuerySchema), listUserOrders);

// Get single order (USER only)
router.get("/:id", authenticate, authorize(["USER"]), getOrderById);

export default router;
