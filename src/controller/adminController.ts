import { Request, Response } from "express";
import Order from "../models/Order";

// --------------------
// Admin: List all orders
// --------------------
export const listAllOrders = async (req: any, res: Response) => {
  try {
    // Pagination
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Filtering by status
    const filter: any = {};
    if (req.query.status) filter.status = req.query.status;

    // Sorting
    let sort: any = { createdAt: -1 }; // default descending
    if (req.query.sort) {
      const sortField = "createdAt"; // currently only support createdAt
      const sortOrder = req.query.sort.toLowerCase() === "ascending" ? 1 : -1;
      sort = { [sortField]: sortOrder };
    }

    const orders = await Order.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate("items.product")
      .populate("user", "name email"); // optional: include user info

    const total = await Order.countDocuments(filter);

    res.json({
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      orders,
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

// --------------------
// Admin: Update order status
// --------------------
export const updateOrderStatus = async (req: any, res: Response) => {
  try {
    const orderId = req.params.id;
    const { status } = req.body;

    const validStatuses = ["PENDING_PAYMENT", "PAID", "SHIPPED", "DELIVERED", "CANCELLED"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.status = status;
    await order.save();

    res.json({ message: "Order status updated", order });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
