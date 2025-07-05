import { PaymentRepository } from '../../../domain/payment/PaymentRepository';
import { Payment } from '../../../domain/payment/Payment';
import { PaymentModel } from './PaymentSchema';

export class PaymentMongoRepository implements PaymentRepository {
  async save(payment: Payment): Promise<Payment> {
    const paymentData = payment.toPersistence();
    
    if (paymentData.id) {
      // Update existing payment using MongoDB _id
      const updated = await PaymentModel.findByIdAndUpdate(
        paymentData.id,
        paymentData,
        { new: true, runValidators: true }
      );
      
      if (!updated) {
        throw new Error('Payment not found');
      }
      
      return this.mapToPayment(updated);
    } else {
      // Create new payment - MongoDB will generate _id automatically
      const { id, ...paymentDataWithoutId } = paymentData; // Remove id field for new payments
      const created = await PaymentModel.create(paymentDataWithoutId);
      return this.mapToPayment(created);
    }
  }

  async findById(id: string): Promise<Payment | null> {
    const payment = await PaymentModel.findById(id);
    return payment ? this.mapToPayment(payment) : null;
  }

  async findByOrderId(orderId: string): Promise<Payment | null> {
    const payment = await PaymentModel.findOne({ orderId });
    return payment ? this.mapToPayment(payment) : null;
  }

  async findByCustomerId(customerId: string): Promise<Payment[]> {
    const payments = await PaymentModel.find({ customerId }).sort({ createdAt: -1 });
    return payments.map(payment => this.mapToPayment(payment));
  }

  async findByStatus(status: string): Promise<Payment[]> {
    const payments = await PaymentModel.find({ status }).sort({ createdAt: -1 });
    return payments.map(payment => this.mapToPayment(payment));
  }

  async findAll(): Promise<Payment[]> {
    const payments = await PaymentModel.find().sort({ createdAt: -1 });
    return payments.map(payment => this.mapToPayment(payment));
  }

  async delete(id: string): Promise<void> {
    await PaymentModel.findByIdAndDelete(id);
  }

  private mapToPayment(doc: any): Payment {
    const data = doc.toObject();
    return Payment.fromPersistence({
      id: data._id.toString(), // MongoDB ObjectId converted to string
      orderId: data.orderId,
      customerId: data.customerId,
      amount: data.amount,
      currency: data.currency,
      method: data.method,
      status: data.status,
      transactionId: data.transactionId,
      gatewayResponse: data.gatewayResponse,
      errorMessage: data.errorMessage,
      description: data.description,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt
    });
  }
} 