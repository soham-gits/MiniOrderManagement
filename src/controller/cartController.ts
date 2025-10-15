import Cart from "../models/Cart";

export const addItem = async (req: any, res: any) => {
  const { product, quantity } = req.body;
  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) cart = new Cart({ user: req.user._id, items: [] });

  const existingItem = cart.items.find(i => i.product.toString() === product);
  if (existingItem) existingItem.quantity += quantity;
  else cart.items.push({ product, quantity });

  await cart.save();
  res.json(cart);
};

export const getCart = async (req: any, res: any) => {
  const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");
  res.json(cart || { items: [] });
};

export const removeItem = async (req: any, res: any) => {
  const { productId } = req.params;
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) return res.status(404).json({ message: "Cart not found" });

  const index = cart.items.findIndex(i => i.product.toString() === productId);
  if (index === -1) return res.status(404).json({ message: "Item not found in cart" });

  cart.items.splice(index, 1);
  await cart.save();
  res.json(cart);
};
