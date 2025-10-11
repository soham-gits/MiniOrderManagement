import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import productRoutes from "./routes/productRoutes";
import orderRoutes from "./routes/orders";
import "express-async-errors";

dotenv.config();

const app = express();
app.use(express.json());

// Routes
app.use("/products", productRoutes);
app.use("/orders", orderRoutes);

// MongoDB Connection
const mongoURI = process.env.MONGO_URI;

mongoose
  .connect(mongoURI!)
  .then(() => {
    console.log("Connected to MongoDB");
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
        console.log('\n --------------------------\n', `| Listening on port ${port} |`, '\n --------------------------');
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
  });
