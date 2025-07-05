import { Request, Response } from 'express';
import { OrderUseCase } from '../../../../application/order/OrderUseCase';

/**
 * @swagger
 * components:
 *   schemas:
 *     OrderItem:
 *       type: object
 *       required:
 *         - productId
 *         - quantity
 *         - price
 *       properties:
 *         productId:
 *           type: string
 *           description: ID del producto
 *           example: "507f1f77bcf86cd799439013"
 *         quantity:
 *           type: integer
 *           description: Cantidad del producto
 *           example: 2
 *         price:
 *           type: number
 *           description: Precio unitario del producto
 *           example: 1299.99
 *         total:
 *           type: number
 *           description: Precio total del item
 *           example: 2599.98
 *     
 *     ShippingAddress:
 *       type: object
 *       required:
 *         - street
 *         - city
 *         - state
 *         - zipCode
 *         - country
 *       properties:
 *         street:
 *           type: string
 *           example: "Calle 123 #45-67"
 *         city:
 *           type: string
 *           example: "Bogotá"
 *         state:
 *           type: string
 *           example: "Cundinamarca"
 *         zipCode:
 *           type: string
 *           example: "110111"
 *         country:
 *           type: string
 *           example: "Colombia"
 *     
 *     Order:
 *       type: object
 *       required:
 *         - customerId
 *         - items
 *         - total
 *         - status
 *       properties:
 *         id:
 *           type: string
 *           description: ID único de la orden (MongoDB ObjectId)
 *           example: "507f1f77bcf86cd799439011"
 *         customerId:
 *           type: string
 *           description: ID del cliente
 *           example: "507f1f77bcf86cd799439012"
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/OrderItem'
 *         status:
 *           type: string
 *           enum: [PENDING, CONFIRMED, SHIPPED, DELIVERED, CANCELLED]
 *           description: Estado de la orden
 *           example: "PENDING"
 *         total:
 *           type: number
 *           description: Total de la orden
 *           example: 3899.97
 *         shippingAddress:
 *           $ref: '#/components/schemas/ShippingAddress'
 *         paymentMethod:
 *           type: string
 *           description: Método de pago
 *           example: "CREDIT_CARD"
 *         trackingNumber:
 *           type: string
 *           description: Número de seguimiento
 *           example: "TRK123456789"
 *         orderHistory:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *               timestamp:
 *                 type: string
 *                 format: date-time
 *               note:
 *                 type: string
 *           description: Historial de cambios de estado
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de creación
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de última actualización
 *     
 *     OrderCreateRequest:
 *       type: object
 *       required:
 *         - customerId
 *         - items
 *         - shippingAddress
 *         - paymentMethod
 *       properties:
 *         customerId:
 *           type: string
 *           example: "507f1f77bcf86cd799439012"
 *         items:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               productId:
 *                 type: string
 *               quantity:
 *                 type: integer
 *           example:
 *             - productId: "507f1f77bcf86cd799439013"
 *               quantity: 2
 *         shippingAddress:
 *           $ref: '#/components/schemas/ShippingAddress'
 *         paymentMethod:
 *           type: string
 *           example: "CREDIT_CARD"
 *     
 *     OrderStatusUpdateRequest:
 *       type: object
 *       required:
 *         - status
 *       properties:
 *         status:
 *           type: string
 *           enum: [PENDING, CONFIRMED, SHIPPED, DELIVERED, CANCELLED]
 *           example: "CONFIRMED"
 *         note:
 *           type: string
 *           description: Nota opcional para el cambio de estado
 *           example: "Orden confirmada y lista para envío"
 *     
 *     Payment:
 *       type: object
 *       required:
 *         - orderId
 *         - amount
 *         - method
 *         - status
 *       properties:
 *         id:
 *           type: string
 *           description: ID único del pago (MongoDB ObjectId)
 *           example: "507f1f77bcf86cd799439011"
 *         orderId:
 *           type: string
 *           description: ID de la orden asociada
 *           example: "507f1f77bcf86cd799439012"
 *         amount:
 *           type: number
 *           description: Monto del pago
 *           example: 3899.97
 *         method:
 *           type: string
 *           enum: [CREDIT_CARD, DEBIT_CARD, BANK_TRANSFER, CASH, DIGITAL_WALLET]
 *           description: Método de pago
 *           example: "CREDIT_CARD"
 *         status:
 *           type: string
 *           enum: [PENDING, PROCESSING, COMPLETED, FAILED, REFUNDED]
 *           description: Estado del pago
 *           example: "PENDING"
 *         transactionId:
 *           type: string
 *           description: ID de transacción del proveedor de pagos
 *           example: "TXN123456789"
 *         processedAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de procesamiento
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de creación
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de última actualización
 *     
 *     Notification:
 *       type: object
 *       required:
 *         - userId
 *         - type
 *         - title
 *         - message
 *         - status
 *       properties:
 *         id:
 *           type: string
 *           description: ID único de la notificación (MongoDB ObjectId)
 *           example: "507f1f77bcf86cd799439011"
 *         userId:
 *           type: string
 *           description: ID del usuario destinatario
 *           example: "507f1f77bcf86cd799439012"
 *         type:
 *           type: string
 *           enum: [ORDER_STATUS, PAYMENT, SHIPPING, PROMOTION, SYSTEM]
 *           description: Tipo de notificación
 *           example: "ORDER_STATUS"
 *         title:
 *           type: string
 *           description: Título de la notificación
 *           example: "Orden confirmada"
 *         message:
 *           type: string
 *           description: Mensaje de la notificación
 *           example: "Tu orden #12345 ha sido confirmada y está siendo preparada"
 *         status:
 *           type: string
 *           enum: [UNREAD, READ, ARCHIVED]
 *           description: Estado de la notificación
 *           example: "UNREAD"
 *         readAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de lectura
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de creación
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de última actualización
 */
import { OrderStatus } from '../../../../domain/order/Order';

export class OrderController {
  constructor(private readonly orderUseCase: OrderUseCase) {}

  /**
   * @swagger
   * /orders:
   *   post:
   *     summary: Crear una nueva orden
   *     description: Crea una nueva orden desde el carrito del cliente
   *     tags: [Orders]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - customerId
   *               - shippingAddress
   *               - paymentMethod
   *             properties:
   *               customerId:
   *                 type: string
   *                 description: ID del cliente
   *                 example: "507f1f77bcf86cd799439012"
   *               shippingAddress:
   *                 $ref: '#/components/schemas/ShippingAddress'
   *               paymentMethod:
   *                 type: string
   *                 description: Método de pago
   *                 example: "CREDIT_CARD"
   *           example:
   *             customerId: "507f1f77bcf86cd799439012"
   *             shippingAddress:
   *               street: "Calle 123 #45-67"
   *               city: "Bogotá"
   *               state: "Cundinamarca"
   *               zipCode: "110111"
   *               country: "Colombia"
   *             paymentMethod: "CREDIT_CARD"
   *     responses:
   *       201:
   *         description: Orden creada exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   type: object
   *                   properties:
   *                     order:
   *                       $ref: '#/components/schemas/Order'
   *                     payment:
   *                       $ref: '#/components/schemas/Payment'
   *       400:
   *         description: Error en los datos de entrada o carrito vacío
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       401:
   *         description: No autorizado
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       404:
   *         description: Cliente o carrito no encontrado
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       500:
   *         description: Error interno del servidor
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  createOrder = async (req: Request, res: Response) => {
    try {
      const { customerId, shippingAddress, paymentMethod } = req.body;

      const result = await this.orderUseCase.createOrderFromCart({
        customerId,
        shippingAddress,
        paymentMethod
      });

      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: result.errorMessage
        });
      }

      res.status(201).json({
        success: true,
        data: {
          order: result.order.toDto(),
          payment: result.payment.toDto()
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error creating order'
      });
    }
  };

  /**
   * @swagger
   * /orders/{id}:
   *   get:
   *     summary: Obtener orden por ID
   *     description: Obtiene los detalles de una orden específica
   *     tags: [Orders]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: ID de la orden
   *         example: "507f1f77bcf86cd799439011"
   *     responses:
   *       200:
   *         description: Orden obtenida exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   $ref: '#/components/schemas/Order'
   *       401:
   *         description: No autorizado
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       404:
   *         description: Orden no encontrada
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       500:
   *         description: Error interno del servidor
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  getOrderById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const order = await this.orderUseCase.getOrderById(id);

      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }

      res.status(200).json({
        success: true,
        data: order.toDto()
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error retrieving order'
      });
    }
  };

  /**
   * @swagger
   * /orders/customer/{customerId}:
   *   get:
   *     summary: Obtener órdenes de un cliente
   *     description: Obtiene todas las órdenes de un cliente específico
   *     tags: [Orders]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: customerId
   *         required: true
   *         schema:
   *           type: string
   *         description: ID del cliente
   *         example: "507f1f77bcf86cd799439012"
   *     responses:
   *       200:
   *         description: Órdenes del cliente obtenidas exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/Order'
   *       401:
   *         description: No autorizado
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       404:
   *         description: Cliente no encontrado
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       500:
   *         description: Error interno del servidor
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  getCustomerOrders = async (req: Request, res: Response) => {
    try {
      const { customerId } = req.params;
      const orders = await this.orderUseCase.getCustomerOrders(customerId);

      res.status(200).json({
        success: true,
        data: orders.map(order => order.toDto())
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error retrieving customer orders'
      });
    }
  };

  /**
   * @swagger
   * /orders/{id}/status:
   *   put:
   *     summary: Actualizar estado de la orden
   *     description: Actualiza el estado de una orden específica
   *     tags: [Orders]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: ID de la orden
   *         example: "507f1f77bcf86cd799439011"
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/OrderStatusUpdateRequest'
   *           example:
   *             status: "CONFIRMED"
   *             note: "Orden confirmada y lista para envío"
   *     responses:
   *       200:
   *         description: Estado de la orden actualizado exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   $ref: '#/components/schemas/Order'
   *       400:
   *         description: Estado inválido o datos de entrada incorrectos
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       401:
   *         description: No autorizado
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       404:
   *         description: Orden no encontrada
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       500:
   *         description: Error interno del servidor
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  updateOrderStatus = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { status, notes } = req.body;

      console.log('Updating order status:', { id, status, notes });

      if (!Object.values(OrderStatus).includes(status)) {
        return res.status(400).json({
          success: false,
          message: `Invalid order status: ${status}. Valid statuses: ${Object.values(OrderStatus).join(', ')}`
        });
      }

      const order = await this.orderUseCase.updateOrderStatus(id, status, notes);

      res.status(200).json({
        success: true,
        data: order.toDto()
      });
    } catch (error) {
      console.error('Error updating order status:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error updating order status'
      });
    }
  };

  /**
   * @swagger
   * /orders/{id}:
   *   delete:
   *     summary: Cancelar orden
   *     description: Cancela una orden específica
   *     tags: [Orders]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: ID de la orden
   *         example: "507f1f77bcf86cd799439011"
   *     requestBody:
   *       required: false
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               reason:
   *                 type: string
   *                 description: Razón de la cancelación
   *                 example: "Cliente solicitó cancelación"
   *     responses:
   *       200:
   *         description: Orden cancelada exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   $ref: '#/components/schemas/Order'
   *       401:
   *         description: No autorizado
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       404:
   *         description: Orden no encontrada
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       500:
   *         description: Error interno del servidor
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  cancelOrder = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      const order = await this.orderUseCase.cancelOrder(id, reason);

      res.status(200).json({
        success: true,
        data: order.toDto()
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error cancelling order'
      });
    }
  };

  /**
   * @swagger
   * /orders/payments/{paymentId}/process:
   *   post:
   *     summary: Procesar pago
   *     description: Procesa el pago de una orden específica
   *     tags: [Payments]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: paymentId
   *         required: true
   *         schema:
   *           type: string
   *         description: ID del pago
   *         example: "507f1f77bcf86cd799439011"
   *     responses:
   *       200:
   *         description: Pago procesado exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   $ref: '#/components/schemas/Payment'
   *       401:
   *         description: No autorizado
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       404:
   *         description: Pago no encontrado
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       500:
   *         description: Error interno del servidor
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  processPayment = async (req: Request, res: Response) => {
    try {
      const { paymentId } = req.params;
      const payment = await this.orderUseCase.processPayment(paymentId);

      res.status(200).json({
        success: true,
        data: payment.toDto()
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error processing payment'
      });
    }
  };

  // Test endpoint to verify the route is working
  testUpdateStatus = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      console.log('Test endpoint called:', { id, status });

      res.status(200).json({
        success: true,
        message: 'Test endpoint working',
        data: { id, status, validStatuses: Object.values(OrderStatus) }
      });
    } catch (error) {
      console.error('Test endpoint error:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Test endpoint error'
      });
    }
  };
} 