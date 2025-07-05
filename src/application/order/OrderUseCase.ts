import { OrderRepository } from '../../domain/order/OrderRepository';
import { CartRepository } from '../../domain/cart/CartRepository';
import { ProductRepository } from '../../domain/product/ProductRepository';
import { Order, OrderStatus, PaymentMethod } from '../../domain/order/Order';
import { Payment, PaymentStatus } from '../../domain/payment/Payment';
import { Notification, NotificationType, NotificationChannel } from '../../domain/notification/Notification';
import { PaymentRepository } from '../../domain/payment/PaymentRepository';
import { NotificationRepository } from '../../domain/notification/NotificationRepository';

export interface CheckoutRequest {
  customerId: string;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    phone?: string;
  };
  paymentMethod: PaymentMethod;
}

export interface CheckoutResult {
  order: Order;
  payment: Payment;
  success: boolean;
  errorMessage?: string;
}

export class OrderUseCase {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly cartRepository: CartRepository,
    private readonly productRepository: ProductRepository,
    private readonly paymentRepository: PaymentRepository,
    private readonly notificationRepository: NotificationRepository
  ) {}

  async createOrderFromCart(checkoutRequest: CheckoutRequest): Promise<CheckoutResult> {
    try {
      // 1. Get cart items
      const cartItems = await this.cartRepository.getCartItems(checkoutRequest.customerId);
      
      if (cartItems.length === 0) {
        return {
          order: null as any,
          payment: null as any,
          success: false,
          errorMessage: 'Cart is empty'
        };
      }

      // 2. Validate stock and get product details
      const orderItems = [];
      for (const cartItem of cartItems) {
        const product = await this.productRepository.findById(cartItem.productId);
        
        if (!product) {
          return {
            order: null as any,
            payment: null as any,
            success: false,
            errorMessage: `Product ${cartItem.productId} not found`
          };
        }

        if (!product.hasStock() || product.stockQuantity < cartItem.quantity) {
          return {
            order: null as any,
            payment: null as any,
            success: false,
            errorMessage: `Insufficient stock for product ${product.name}`
          };
        }

        orderItems.push({
          productId: product.id,
          productName: product.name,
          quantity: cartItem.quantity,
          unitPrice: product.price,
          subtotal: product.price * cartItem.quantity
        });
      }

      // 3. Create order
      const order = new Order(
        checkoutRequest.customerId,
        orderItems,
        checkoutRequest.shippingAddress,
        checkoutRequest.paymentMethod
      );

      const savedOrder = await this.orderRepository.save(order);

      // 4. Create payment
      const payment = new Payment(
        savedOrder.id,
        checkoutRequest.customerId,
        savedOrder.total,
        'USD', // Default currency
        checkoutRequest.paymentMethod,
        `Payment for order ${savedOrder.id}`
      );

      const savedPayment = await this.paymentRepository.save(payment);

      // 5. Reserve stock
      for (const cartItem of cartItems) {
        const product = await this.productRepository.findById(cartItem.productId);
        if (product) {
          product.decreaseStock(cartItem.quantity);
          await this.productRepository.save(product);
        }
      }

      // 6. Clear cart
      await this.cartRepository.clearCart(checkoutRequest.customerId);

      // 7. Send notification
      await this.sendOrderCreatedNotification(savedOrder);

      return {
        order: savedOrder,
        payment: savedPayment,
        success: true
      };

    } catch (error) {
      return {
        order: null as any,
        payment: null as any,
        success: false,
        errorMessage: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async getOrderById(orderId: string): Promise<Order | null> {
    return await this.orderRepository.findById(orderId);
  }

  async getCustomerOrders(customerId: string): Promise<Order[]> {
    return await this.orderRepository.findByCustomerId(customerId);
  }

  async updateOrderStatus(orderId: string, status: OrderStatus, notes?: string): Promise<Order> {
    const order = await this.orderRepository.findById(orderId);
    
    if (!order) {
      throw new Error('Order not found');
    }

    // Update order status based on new status
    switch (status) {
      case OrderStatus.CONFIRMED:
        order.confirm();
        break;
      case OrderStatus.PROCESSING:
        order.process();
        break;
      case OrderStatus.SHIPPED:
        // Generate tracking number for demo
        const trackingNumber = `TRK-${Date.now()}`;
        order.ship(trackingNumber);
        break;
      case OrderStatus.DELIVERED:
        order.deliver();
        break;
      case OrderStatus.CANCELLED:
        order.cancel(notes);
        break;
      default:
        throw new Error('Invalid order status');
    }

    const updatedOrder = await this.orderRepository.save(order);

    // Send notification about status change
    await this.sendOrderStatusNotification(updatedOrder, status);

    return updatedOrder;
  }

  async cancelOrder(orderId: string, reason?: string): Promise<Order> {
    const order = await this.orderRepository.findById(orderId);
    
    if (!order) {
      throw new Error('Order not found');
    }

    if (!order.canBeCancelled()) {
      throw new Error('Order cannot be cancelled in current status');
    }

    order.cancel(reason);
    const cancelledOrder = await this.orderRepository.save(order);

    // Restore stock
    for (const item of order.items) {
      const product = await this.productRepository.findById(item.productId);
      if (product) {
        product.increaseStock(item.quantity);
        await this.productRepository.save(product);
      }
    }

    // Send cancellation notification
    await this.sendOrderStatusNotification(cancelledOrder, OrderStatus.CANCELLED);

    return cancelledOrder;
  }

  async processPayment(paymentId: string): Promise<Payment> {
    const payment = await this.paymentRepository.findById(paymentId);
    
    if (!payment) {
      throw new Error('Payment not found');
    }

    if (!payment.canBeProcessed()) {
      throw new Error('Payment cannot be processed in current status');
    }

    // Simulate payment processing
    payment.process();
    
    // Simulate successful payment (in real app, this would call payment gateway)
    const transactionId = `TXN-${Date.now()}`;
    payment.complete(transactionId, { gateway: 'demo', status: 'success' });

    const processedPayment = await this.paymentRepository.save(payment);

    // Update order status to confirmed
    const order = await this.orderRepository.findById(payment.orderId);
    if (order) {
      order.confirm();
      await this.orderRepository.save(order);
    }

    // Send payment confirmation notification
    await this.sendPaymentStatusNotification(processedPayment);

    return processedPayment;
  }

  private async sendOrderCreatedNotification(order: Order): Promise<void> {
    const notification = new Notification(
      order.customerId,
      NotificationType.ORDER_STATUS,
      NotificationChannel.EMAIL,
      {
        title: 'Order Created Successfully',
        message: `Your order #${order.id} has been created and is being processed. Total: $${order.total}`,
        data: { orderId: order.id, total: order.total }
      }
    );

    await this.notificationRepository.save(notification);
  }

  private async sendOrderStatusNotification(order: Order, status: OrderStatus): Promise<void> {
    const statusMessages: Record<OrderStatus, string> = {
      [OrderStatus.PENDING]: 'Your order is pending confirmation',
      [OrderStatus.CONFIRMED]: 'Your order has been confirmed and is being processed',
      [OrderStatus.PROCESSING]: 'Your order is being prepared for shipment',
      [OrderStatus.SHIPPED]: `Your order has been shipped! Tracking: ${order.trackingNumber}`,
      [OrderStatus.DELIVERED]: 'Your order has been delivered successfully',
      [OrderStatus.CANCELLED]: 'Your order has been cancelled'
    };

    const notification = new Notification(
      order.customerId,
      NotificationType.ORDER_STATUS,
      NotificationChannel.EMAIL,
      {
        title: `Order Status Update - ${status}`,
        message: statusMessages[status] || `Your order status has been updated to ${status}`,
        data: { orderId: order.id, status, trackingNumber: order.trackingNumber }
      }
    );

    await this.notificationRepository.save(notification);
  }

  private async sendPaymentStatusNotification(payment: Payment): Promise<void> {
    const notification = new Notification(
      payment.customerId,
      NotificationType.PAYMENT_STATUS,
      NotificationChannel.EMAIL,
      {
        title: 'Payment Processed Successfully',
        message: `Your payment of $${payment.amount} has been processed successfully. Transaction ID: ${payment.transactionId}`,
        data: { paymentId: payment.id, amount: payment.amount, transactionId: payment.transactionId }
      }
    );

    await this.notificationRepository.save(notification);
  }
} 