import Cart from "../models/Cart";
import Product from "../models/Product"; // assuming you have a Product model
import { AuthRequest } from "../middleware/auth";
import { Response } from "express";

// Add item to cart with validation
export const addItem = async (req: AuthRequest, res: Response) => {
  const { product, quantity } = req.body;

  // Check if product exists
  const productDoc = await Product.findById(product);
  if (!productDoc) return res.status(404).json({ message: `Product with ID ${product} not found` });

  // Check stock availability
  if (productDoc.stock < quantity) {
    return res.status(400).json({
      message: `Not enough stock for ${productDoc.name}. Available: ${productDoc.stock}`,
    });
  }

  // Find or create user's cart
  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) cart = new Cart({ user: req.user._id, items: [] });

  // Add or update item
  const existingItem = cart.items.find(i => i.product.toString() === product);
  if (existingItem) {
    if (productDoc.stock < existingItem.quantity + quantity) {
      return res.status(400).json({
        message: `Cannot add ${quantity}. Total quantity exceeds available stock for ${productDoc.name}.`,
      });
    }
    existingItem.quantity += quantity;
  } else {
    cart.items.push({ product, quantity });
  }

  await cart.save();
  res.json(cart);
};

// Get cart
export const getCart = async (req: AuthRequest, res: Response) => {
  const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");
  res.json(cart || { items: [] });
};

// Remove item from cart
export const removeItem = async (req: AuthRequest, res: Response) => {
  const { productId } = req.params;
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) return res.status(404).json({ message: "Cart not found" });

  const index = cart.items.findIndex(i => i.product.toString() === productId);
  if (index === -1) return res.status(404).json({ message: "Item not found in cart" });

  cart.items.splice(index, 1);
  await cart.save();
  res.json(cart);
};
