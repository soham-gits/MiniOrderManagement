import mongoose, { Schema, Document } from "mongoose";

export interface IProduct extends Document {
  name: string;
  price: number;
  description?: string;
  stock: number;       // total available stock
  reservedStock: number; // currently reserved (not sold yet)
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>({
  name: { type: String, required: true, index: true },
  price: { type: Number, required: true },
  description: { type: String },
  stock: { type: Number, required: true, min: 0, default: 0 },
  reservedStock: { type: Number, required: true, min: 0, default: 0 },
}, { timestamps: true });

export default mongoose.model<IProduct>("Product", ProductSchema);
