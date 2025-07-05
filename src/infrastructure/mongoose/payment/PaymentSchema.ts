import mongoose from 'mongoose';
import { PaymentStatus, PaymentMethod } from '../../../domain/payment/Payment';

const PaymentSchema = new mongoose.Schema({
  orderId: { type: String, required: true },
  customerId: { type: String, required: true },
  amount: { type: Number, required: true },
  currency: { type: String, required: true },
  method: { type: String, enum: Object.values(PaymentMethod), required: true },
  status: { type: String, enum: Object.values(PaymentStatus), default: PaymentStatus.PENDING },
  transactionId: { type: String },
  gatewayResponse: { type: mongoose.Schema.Types.Mixed },
  errorMessage: { type: String },
  description: { type: String }
}, { timestamps: true });

export const PaymentModel = mongoose.model('Payment', PaymentSchema); 