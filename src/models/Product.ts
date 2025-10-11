import mongoose, { Schema, Document } from 'mongoose';


export interface IProduct extends Document {
    name: string;
    price: number;
    stock: number;
}


const ProductSchema = new Schema<IProduct>({
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, min: 0 }
});


export const Product = mongoose.model<IProduct>('Product', ProductSchema);