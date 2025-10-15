import { Request, Response } from "express";
import mongoose from "mongoose";
import Order from "../models/Order";
import Product from "../models/Product";
import Payment from "../models/Payment";
import { removeCancelJob } from "../services/cancelOrderQueue";
import { enqueueEmail } from "../services/emailQueue";

export async function payOrder(req: Request, res: Response) {
  const orderId = req.params.id;
  const userId = (req as any).user?._id;

  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      // Find order belonging to user
      const order = await Order.findOne({ _id: orderId, user: userId })
        .populate("user", "email")
        .session(session);

      if (!order) throw new Error("Order not found");
      if (order.status !== "PENDING_PAYMENT") throw new Error("Order not payable");

      // Mock payment
      const transactionId = `txn_${Date.now()}`;

      await Payment.create(
        [
          {
            order: order._id,
            transactionId,
            amount: order.totalAmount,
            status: "SUCCESS",
          },
        ],
        { session }
      );

      // Update order status
      order.status = "PAID";
      await order.save({ session });

      // Adjust stock for each product
      for (const item of order.items) {
        const product = await Product.findById(item.product).session(session);
        if (!product) throw new Error(`Product not found: ${item.product}`);
        if (product.reservedStock < item.quantity)
          throw new Error(`Reserved stock mismatch for product: ${product.name}`);

        product.reservedStock -= item.quantity;
        product.stock -= item.quantity;

        if (product.stock < 0) throw new Error(`Stock underflow for product: ${product.name}`);

        await product.save({ session });
      }
    });

    // Fetch order again safely for job removal and email
    const order = await Order.findById(orderId).populate("user", "email");
    if (!order) return res.status(404).json({ message: "Order not found after payment" });

    // Remove cancel job if exists
    if (order.paymentJobId) await removeCancelJob(order.paymentJobId);

    // Enqueue confirmation email
    // Enqueue confirmation email
    const userEmail = (order.user as any)?.email;

    // Cast _id to string for safety
    const orderIdStr = order._id instanceof mongoose.Types.ObjectId
      ? order._id.toString()
      : String(order._id);

    if (userEmail) {
      await enqueueEmail({ orderId: orderIdStr, userEmail });
    }

    return res.json({ message: "Payment successful", orderId });
  } catch (err: any) {
    return res.status(400).json({ message: err?.message || "Payment failed" });
  } finally {
    session.endSession();
  }
}


export const listUserOrders = async (req: any, res: Response) => {
  try {
    const userId = req.user._id;

    // Pagination query params
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Optional filter by status
    const statusFilter = req.query.status ? { status: req.query.status } : {};

    const filter = { user: userId, ...statusFilter };

    const orders = await Order.find(filter)
      .sort({ createdAt: -1 }) // descending
      .skip(skip)
      .limit(limit)
      .populate("items.product"); // include product details

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


export const getOrderById = async (req: any, res: Response) => {
  try {
    const userId = req.user._id;
    const orderId = req.params.id;

    const order = await Order.findOne({ _id: orderId, user: userId }).populate("items.product");
    if (!order) return res.status(404).json({ message: "Order not found" });

    res.json(order);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
