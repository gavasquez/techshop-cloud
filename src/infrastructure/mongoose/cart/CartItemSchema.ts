import { Schema, model, Document, Types } from "mongoose";

export interface CartItemDocument extends Document {
    userId: string;
    productId: Types.ObjectId;
    quantity: number;
    addedAt: Date;
}

const CartItemSchema = new Schema<CartItemDocument>({
    userId: { type: String, required: true },
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    quantity: { type: Number, required: true },
    addedAt: { type: Date, default: Date.now }
});


export const CartItemModel = model<CartItemDocument>("CartItem", CartItemSchema);
