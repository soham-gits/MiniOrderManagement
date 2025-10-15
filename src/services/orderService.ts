import mongoose from "mongoose";
import Order, { IOrder } from "../models/Order";
import Cart, { ICart } from "../models/Cart";
import Product, { IProduct } from "../models/Product";
import { queueCancelOrder } from "./cancelOrderQueue";
import { enqueueEmail } from "./emailQueue";

// ---------------------------
// Helper Types
// ---------------------------
type PopulatedCartItem = {
  product: IProduct;
  quantity: number;
};

type PopulatedCart = ICart & {
  items: PopulatedCartItem[];
};

// ---------------------------
// Checkout Function
// ---------------------------
export async function checkout(userId: string): Promise<IOrder> {
  const session = await mongoose.startSession();

  try {
    const createdOrder = await session.withTransaction(async (): Promise<IOrder> => {
      const cart = (await Cart.findOne({ user: userId })
        .populate<{ items: PopulatedCartItem[] }>("items.product")
        .session(session)) as PopulatedCart | null;

      if (!cart || cart.items.length === 0) throw new Error("Cart is empty");

      let total = 0;
      const orderItems: IOrder["items"] = [];

      for (const it of cart.items) {
        const product = it.product;
        if (!product) throw new Error("Product not found");

        if (product.stock - product.reservedStock < it.quantity)
          throw new Error(`Insufficient stock for ${product.name}`);

        product.reservedStock += it.quantity;
        await product.save({ session });

        orderItems.push({
          product: product._id,
          quantity: it.quantity,
          priceAtPurchase: product.price,
        });

        total += product.price * it.quantity;
      }

      const [orderDoc] = await Order.create(
        [
          {
            user: new mongoose.Types.ObjectId(userId),
            items: orderItems,
            totalAmount: total,
            status: "PENDING_PAYMENT",
          },
        ],
        { session }
      );

      cart.items = [];
      await cart.save({ session });

      return orderDoc as IOrder; // <-- cast here
    });

    if (!createdOrder) throw new Error("Order creation failed");

    // Cast _id as Types.ObjectId
    const jobId = await queueCancelOrder((createdOrder._id as mongoose.Types.ObjectId).toString());
    createdOrder.paymentJobId = jobId;
    await createdOrder.save();

    return createdOrder;
  } finally {
    session.endSession();
  }
}

// ---------------------------
// Pay Order Function
// ---------------------------
export async function payOrder(orderId: string): Promise<void> {
  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      const order = await Order.findById(orderId)
        .populate<{ items: { product: IProduct; quantity: number; priceAtPurchase: number }[] }>("items.product")
        .session(session);

      if (!order) throw new Error("Order not found");
      if (order.status !== "PENDING_PAYMENT") throw new Error("Order already processed");

      // Update order status
      order.status = "PAID";
      await order.save({ session });

      // Decrement stock
      for (const item of order.items) {
        const product = item.product;
        if (!product) throw new Error("Product not found");

        product.stock -= item.quantity;
        product.reservedStock -= item.quantity;
        await product.save({ session });
      }

      // Enqueue confirmation email
      enqueueEmail(order._id);
    });
  } finally {
    session.endSession();
  }
}
