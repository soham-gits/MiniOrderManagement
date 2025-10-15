import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import "express-async-errors";

dotenv.config();

import authRoutes from "./routes/auth";
import productRoutes from "./routes/products";
import cartRoutes from "./routes/cart";
import orderRoutes from "./routes/orders";
import adminRoutes from "./routes/admin";
import { errorHandler } from "./middleware/errorHandler";

// Start queue workers (or run worker separately if you prefer)
import "./jobs/worker";
import { connectDB } from "./config/db";

const app = express();
app.use(express.json());

// routes
app.use("/auth", authRoutes);
app.use("/products", productRoutes);
app.use("/cart", cartRoutes);
app.use("/orders", orderRoutes);
app.use("/admin", adminRoutes);

// error handler
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI!;

// Connect to DB and start server
connectDB(MONGO_URI).then(() => {
  app.listen(PORT, () => {
    console.log(`
--------------------------
| Listening on port ${PORT} |
--------------------------`);
  });
});
