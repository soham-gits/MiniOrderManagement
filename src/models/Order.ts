import mongoose, { Schema, Document, Types } from 'mongoose';


export interface IOrderProduct {
    productId: Types.ObjectId;
    qty: number;
    priceAtPurchase: number;
}


export interface IOrder extends Document {
    userName: string;
    products: IOrderProduct[];
    totalAmount: number;
    createdAt: Date;
}


const OrderProductSchema = new Schema<IOrderProduct>({
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    qty: { type: Number, required: true, min: 1 },
    priceAtPurchase: { type: Number, required: true }
});


const OrderSchema = new Schema<IOrder>({
    userName: { type: String, required: true },
    products: { type: [OrderProductSchema], required: true },
    totalAmount: { type: Number, required: true },
    createdAt: { type: Date, default: () => new Date() }
});


export const Order = mongoose.model<IOrder>('Order', OrderSchema);