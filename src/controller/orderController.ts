import { Request, Response } from "express";
import { orderSchema } from "../validation";
import * as orderService from "../services/orderService";

export const addOrder = async (req: Request, res: Response) => {
  const { error, value } = orderSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  try {
    const order = await orderService.createOrder(value.userName, value.products);
    res.status(201).json(order);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const getOrders = async (_req: Request, res: Response) => {
  const orders = await orderService.listOrders();
  res.json(orders);
};
