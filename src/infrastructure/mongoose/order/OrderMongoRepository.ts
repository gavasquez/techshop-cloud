import { OrderRepository } from '../../../domain/order/OrderRepository';
import { Order } from '../../../domain/order/Order';
import { OrderModel } from './OrderSchema';

export class OrderMongoRepository implements OrderRepository {
  async save(order: Order): Promise<Order> {
    const orderData = order.toPersistence();
    
    if (orderData.id) {
      // Update existing order using MongoDB _id
      const updated = await OrderModel.findByIdAndUpdate(
        orderData.id,
        orderData,
        { new: true, runValidators: true }
      );
      
      if (!updated) {
        throw new Error('Order not found');
      }
      
      return this.mapToOrder(updated);
    } else {
      // Create new order - MongoDB will generate _id automatically
      const { id, ...orderDataWithoutId } = orderData; // Remove id field for new orders
      const created = await OrderModel.create(orderDataWithoutId);
      return this.mapToOrder(created);
    }
  }

  async findById(id: string): Promise<Order | null> {
    const order = await OrderModel.findById(id);
    return order ? this.mapToOrder(order) : null;
  }

  async findByCustomerId(customerId: string): Promise<Order[]> {
    const orders = await OrderModel.find({ customerId }).sort({ createdAt: -1 });
    return orders.map(order => this.mapToOrder(order));
  }

  async findByStatus(status: string): Promise<Order[]> {
    const orders = await OrderModel.find({ status }).sort({ createdAt: -1 });
    return orders.map(order => this.mapToOrder(order));
  }

  async findAll(): Promise<Order[]> {
    const orders = await OrderModel.find().sort({ createdAt: -1 });
    return orders.map(order => this.mapToOrder(order));
  }

  async delete(id: string): Promise<void> {
    await OrderModel.findByIdAndDelete(id);
  }

  private mapToOrder(doc: any): Order {
    const data = doc.toObject();
    return Order.fromPersistence({
      id: data._id.toString(), // MongoDB ObjectId converted to string
      customerId: data.customerId,
      items: data.items,
      status: data.status,
      total: data.total,
      shippingAddress: data.shippingAddress,
      paymentMethod: data.paymentMethod,
      trackingNumber: data.trackingNumber,
      orderHistory: data.orderHistory,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt
    });
  }
} 