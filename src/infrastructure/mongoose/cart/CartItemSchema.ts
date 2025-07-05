import { Schema, model, Document } from "mongoose";

export interface CartItemDocument extends Document {
    userId: string;
    productId: string;
    quantity: number;
    addedAt: Date;
}

const CartItemSchema = new Schema<CartItemDocument>({
    userId: { type: String, required: true },
    productId: { type: String, required: true },
    quantity: { type: Number, required: true },
    addedAt: { type: Date, default: Date.now }
});


export const CartItemModel = model<CartItemDocument>("CartItem", CartItemSchema);
