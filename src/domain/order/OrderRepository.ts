import { Order } from './Order';

export interface OrderRepository {
  save(order: Order): Promise<Order>;
  findById(id: string): Promise<Order | null>;
  findByCustomerId(customerId: string): Promise<Order[]>;
  findByStatus(status: string): Promise<Order[]>;
  findAll(): Promise<Order[]>;
  delete(id: string): Promise<void>;
} 