// services/cancelOrderQueue.ts
import Bull from "bull";
import Order from "../models/Order";
import Product from "../models/Product";
import mongoose from "mongoose";

const redisUrl = process.env.REDIS_URL || "redis://127.0.0.1:6379";
export const cancelQueue = new Bull("cancel-order-queue", redisUrl);

export async function queueCancelOrder(orderId: string): Promise<string> {
  const delay = (Number(process.env.ORDER_PAYMENT_GRACE_MINUTES || 15) * 60 * 1000);
  const job = await cancelQueue.add({ orderId }, { delay, attempts: 1 });
  return job.id.toString();
}

export async function removeCancelJob(jobId: string): Promise<void> {
  const job = await cancelQueue.getJob(jobId);
  if (job) await job.remove();
}

// ---------------- Worker ----------------
export function initCancelWorker() {
  cancelQueue.process(async (job) => {
    const { orderId } = job.data;
    const order = await Order.findById(orderId);
    if (!order) return;
    if (order.status === "PAID" || order.status !== "PENDING_PAYMENT") return;

    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        // Cancel the order
        order.status = "CANCELLED";
        await order.save({ session });

        // Release reserved stock
        for (const it of order.items) {
          const product = await Product.findById(it.product).session(session);
          if (!product) continue;
          product.reservedStock -= it.quantity;
          if (product.reservedStock < 0) product.reservedStock = 0;
          await product.save({ session });
        }
      });
    } finally {
      session.endSession();
    }
  });

  console.log("✅ Cancel order worker initialized and listening for jobs");
}
