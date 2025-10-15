import mongoose, { Schema, Document } from "mongoose";

export type PaymentStatus = "SUCCESS" | "FAILED";

export interface IPayment extends Document {
  order: mongoose.Types.ObjectId;
  transactionId: string;
  amount: number;
  status: PaymentStatus;
  createdAt: Date;
}

const PaymentSchema = new Schema<IPayment>({
  order: { type: Schema.Types.ObjectId, ref: "Order", required: true },
  transactionId: { type: String, required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ["SUCCESS", "FAILED"], required: true },
}, { timestamps: true });

export default mongoose.model<IPayment>("Payment", PaymentSchema);
