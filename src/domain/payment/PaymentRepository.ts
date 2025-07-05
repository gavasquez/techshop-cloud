import { Payment } from './Payment';

export interface PaymentRepository {
  save(payment: Payment): Promise<Payment>;
  findById(id: string): Promise<Payment | null>;
  findByOrderId(orderId: string): Promise<Payment | null>;
  findByCustomerId(customerId: string): Promise<Payment[]>;
  findByStatus(status: string): Promise<Payment[]>;
  findAll(): Promise<Payment[]>;
  delete(id: string): Promise<void>;
} 