import { Router, RequestHandler } from 'express';
import { OrderController } from '../controllers/order/OrderController';
import { OrderMongoRepository } from '../../../infrastructure/mongoose/order/OrderMongoRepository';
import { CartMongoRepository } from '../../../infrastructure/mongoose/cart/CartMongoRepository';
import { ProductMongoRepository } from '../../../infrastructure/mongoose/product/ProductMongoRepository';
import { PaymentMongoRepository } from '../../../infrastructure/mongoose/payment/PaymentMongoRepository';
import { NotificationMongoRepository } from '../../../infrastructure/mongoose/notification/NotificationMongoRepository';
import { OrderUseCase } from '../../../application/order/OrderUseCase';
import { AuthMiddleware } from '../../../infrastructure/security/AuthMiddleware';
import { JwtTokenProvider } from '../../../infrastructure/security/JwtTokenProvider';
import { UserMongoRepository } from '../../../infrastructure/mongoose/user/UserMongoRepository';

const orderRepository = new OrderMongoRepository();
const cartRepository = new CartMongoRepository();
const productRepository = new ProductMongoRepository();
const paymentRepository = new PaymentMongoRepository();
const notificationRepository = new NotificationMongoRepository();

const orderUseCase = new OrderUseCase(
  orderRepository,
  cartRepository,
  productRepository,
  paymentRepository,
  notificationRepository
);

const orderController = new OrderController(orderUseCase);

// Auth middleware setup
const userRepo = new UserMongoRepository();
const jwtTokenProvider = new JwtTokenProvider();
const authMiddleware = new AuthMiddleware(jwtTokenProvider, userRepo);

const orderRoutes = Router();

// All order routes require authentication
orderRoutes.post('/', authMiddleware.authenticate as RequestHandler, orderController.createOrder as RequestHandler);
orderRoutes.get('/:id', authMiddleware.authenticate as RequestHandler, orderController.getOrderById as RequestHandler);
orderRoutes.get('/customer/:customerId', authMiddleware.authenticate as RequestHandler, orderController.getCustomerOrders as RequestHandler);
orderRoutes.put('/:id/status', authMiddleware.authenticate as RequestHandler, orderController.updateOrderStatus as RequestHandler);
orderRoutes.delete('/:id', authMiddleware.authenticate as RequestHandler, orderController.cancelOrder as RequestHandler);

// Test route
orderRoutes.put('/:id/status/test', authMiddleware.authenticate as RequestHandler, orderController.testUpdateStatus as RequestHandler);

// Payment routes
orderRoutes.post('/payments/:paymentId/process', authMiddleware.authenticate as RequestHandler, orderController.processPayment as RequestHandler);

export default orderRoutes; 