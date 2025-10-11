import mongoose, { Types } from "mongoose";
import { Product, IProduct } from "../models/Product";
import { Order, IOrder } from "../models/Order";

interface OrderItem {
  productId: string;
  qty: number;
}

export const createOrder = async (userName: string, products: OrderItem[]) => {
  const session = await mongoose.startSession();
  let createdOrder: IOrder[] = [];

  await session.withTransaction(async () => {
    const productIds = products.map((p) => new Types.ObjectId(p.productId));
    const dbProducts = await Product.find({ _id: { $in: productIds } }).session(session).lean<IProduct[]>();

    if (dbProducts.length !== productIds.length) throw new Error("One or more products not found");

    // Validate stock
    for (const ordItem of products) {
      const dbProd = dbProducts.find((p) => (p._id as Types.ObjectId).equals(ordItem.productId));
      if (!dbProd) throw new Error(`Product ${ordItem.productId} not found`);
      if (dbProd.stock < ordItem.qty)
        throw new Error(`Not enough stock for product ${dbProd._id}: available ${dbProd.stock}, required ${ordItem.qty}`);
    }

    // Decrement stock
    for (const ordItem of products) {
      const upd = await Product.updateOne(
        { _id: ordItem.productId, stock: { $gte: ordItem.qty } },
        { $inc: { stock: -ordItem.qty } }
      ).session(session);

      if (upd.matchedCount === 0 || upd.modifiedCount === 0) throw new Error(`Failed to decrement stock for product ${ordItem.productId}`);
    }

    // Calculate total
    let totalAmount = 0;
    const productsForOrder = products.map((ordItem) => {
      const dbProd = dbProducts.find((p) => (p._id as Types.ObjectId).equals(ordItem.productId));
      if (!dbProd) throw new Error(`Product ${ordItem.productId} not found`);
      const priceAtPurchase = dbProd.price;
      totalAmount += priceAtPurchase * ordItem.qty;
      return { productId: dbProd._id, qty: ordItem.qty, priceAtPurchase };
    });

    createdOrder = await Order.create([{ userName, products: productsForOrder, totalAmount }], { session });
  });

  session.endSession();
  return createdOrder[0];
};

export const listOrders = async () => {
  return Order.find().populate("products.productId");
};
