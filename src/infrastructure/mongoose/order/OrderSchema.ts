import mongoose from 'mongoose';
import { OrderStatus, PaymentMethod } from '../../../domain/order/Order';

const OrderItemSchema = new mongoose.Schema({
  productId: { type: String, required: true },
  productName: { type: String, required: true },
  quantity: { type: Number, required: true },
  unitPrice: { type: Number, required: true },
  subtotal: { type: Number, required: true }
});

const ShippingAddressSchema = new mongoose.Schema({
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zipCode: { type: String, required: true },
  country: { type: String, required: true },
  phone: { type: String }
});

const OrderHistorySchema = new mongoose.Schema({
  status: { type: String, enum: Object.values(OrderStatus), required: true },
  timestamp: { type: Date, required: true },
  notes: { type: String }
});

const OrderSchema = new mongoose.Schema({
  customerId: { type: String, required: true },
  items: [OrderItemSchema],
  status: { type: String, enum: Object.values(OrderStatus), default: OrderStatus.PENDING },
  total: { type: Number, required: true },
  shippingAddress: ShippingAddressSchema,
  paymentMethod: { type: String, enum: Object.values(PaymentMethod), required: true },
  trackingNumber: { type: String },
  orderHistory: [OrderHistorySchema]
}, { timestamps: true });

export const OrderModel = mongoose.model('Order', OrderSchema); 