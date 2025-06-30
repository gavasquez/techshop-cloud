import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  stockQuantity: { type: Number, required: true }
}, { timestamps: true });


export const ProductModel = mongoose.model('Product', ProductSchema);
