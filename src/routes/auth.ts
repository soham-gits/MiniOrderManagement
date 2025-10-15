import { Router, Request, Response } from "express";
import User from "../models/User";
import jwt from "jsonwebtoken";
import { validateBody } from "../middleware/validate"; // your middleware
import Joi from "joi";

const router = Router();

// ---------------------------
//  Joi schemas
// ---------------------------
const registerSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

// ---------------------------
// Register route
// ---------------------------
router.post("/register", validateBody(registerSchema), async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  // Check if user already exists
  const existing = await User.findOne({ email });
  if (existing) return res.status(400).json({ message: "User already exists" });

  // Create and save user
  const user = new User({ name, email, password });
  await user.save(); // password will be hashed automatically

  res.json({ message: "User registered successfully" });
});

// ---------------------------
// Login route
// ---------------------------
router.post("/login", validateBody(loginSchema), async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // Find user
  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ message: "Invalid credentials" });

  // Compare password
  const isMatch = await user.comparePassword(password);
  if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

  // Sign JWT
  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET!, {
    expiresIn: "1d",
  });

  res.json({ token });
});

export default router;
