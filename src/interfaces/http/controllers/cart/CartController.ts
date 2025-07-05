import { Request, Response } from "express";
import { CartUseCase } from "../../../../application/cart/CartUseCase";

/**
 * @swagger
 * components:
 *   schemas:
 *     CartItem:
 *       type: object
 *       required:
 *         - productId
 *         - quantity
 *       properties:
 *         id:
 *           type: string
 *           description: ID único del item del carrito (MongoDB ObjectId)
 *           example: "507f1f77bcf86cd799439011"
 *         customerId:
 *           type: string
 *           description: ID del cliente
 *           example: "507f1f77bcf86cd799439012"
 *         productId:
 *           type: string
 *           description: ID del producto
 *           example: "507f1f77bcf86cd799439013"
 *         quantity:
 *           type: integer
 *           description: Cantidad del producto
 *           example: 2
 *         product:
 *           $ref: '#/components/schemas/Product'
 *         totalPrice:
 *           type: number
 *           description: Precio total del item
 *           example: 2599.98
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de creación
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de última actualización
 *     
 *     CartItemCreateRequest:
 *       type: object
 *       required:
 *         - productId
 *         - quantity
 *       properties:
 *         productId:
 *           type: string
 *           example: "507f1f77bcf86cd799439013"
 *         quantity:
 *           type: integer
 *           example: 2
 *     
 *     CartSummary:
 *       type: object
 *       properties:
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/CartItem'
 *         totalItems:
 *           type: integer
 *           description: Total de items en el carrito
 *           example: 3
 *         totalPrice:
 *           type: number
 *           description: Precio total del carrito
 *           example: 3899.97
 */

export class CartController {
    constructor(private readonly cartUseCase: CartUseCase) { }

    /**
     * @swagger
     * /cart:
     *   post:
     *     summary: Agregar producto al carrito
     *     description: Agrega un producto al carrito de compras del usuario
     *     tags: [Cart]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - userId
     *               - productId
     *               - quantity
     *             properties:
     *               userId:
     *                 type: string
     *                 description: ID del usuario
     *                 example: "507f1f77bcf86cd799439012"
     *               productId:
     *                 type: string
     *                 description: ID del producto
     *                 example: "507f1f77bcf86cd799439013"
     *               quantity:
     *                 type: integer
     *                 description: Cantidad a agregar
     *                 example: 2
     *           example:
     *             userId: "507f1f77bcf86cd799439012"
     *             productId: "507f1f77bcf86cd799439013"
     *             quantity: 2
     *     responses:
     *       201:
     *         description: Producto agregado al carrito exitosamente
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: "Producto agregado al carrito"
     *                 item:
     *                   $ref: '#/components/schemas/CartItem'
     *       400:
     *         description: Datos de entrada inválidos
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
     *         description: Producto no encontrado
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
    addToCart = async (req: Request, res: Response) => {
        const { userId, productId, quantity } = req.body;

        try {
            const item = await this.cartUseCase.addToCart(userId, productId, quantity);
            res.status(201).json({ message: "Producto agregado al carrito", item });
        } catch (err) {
            res.status(500).json({ message: "Error al agregar al carrito" });
        }
    };

    /**
     * @swagger
     * /cart/{userId}:
     *   get:
     *     summary: Obtener items del carrito
     *     description: Obtiene todos los productos en el carrito de un usuario
     *     tags: [Cart]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: userId
     *         required: true
     *         schema:
     *           type: string
     *         description: ID del usuario
     *         example: "507f1f77bcf86cd799439012"
     *     responses:
     *       200:
     *         description: Items del carrito obtenidos exitosamente
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 items:
     *                   type: array
     *                   items:
     *                     $ref: '#/components/schemas/CartItem'
     *       401:
     *         description: No autorizado
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       404:
     *         description: Usuario no encontrado
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
    getCartItems = async (req: Request, res: Response) => {
        const userId = req.params.userId;
        try {
            const items = await this.cartUseCase.getCartItems(userId);
            res.status(200).json({ items });
        } catch (err) {
            res.status(500).json({ message: "Error al obtener el carrito" });
        }
    };

    /**
     * @swagger
     * /cart/{id}:
     *   delete:
     *     summary: Eliminar item del carrito
     *     description: Elimina un producto específico del carrito
     *     tags: [Cart]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: ID del item del carrito
     *         example: "507f1f77bcf86cd799439011"
     *     responses:
     *       200:
     *         description: Item eliminado del carrito exitosamente
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: "Producto eliminado del carrito"
     *       401:
     *         description: No autorizado
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       404:
     *         description: Item no encontrado
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
    removeFromCart = async (req: Request, res: Response) => {
        const { id } = req.params;

        try {
            await this.cartUseCase.removeFromCart(id);
            res.status(200).json({ message: "Producto eliminado del carrito" });
        } catch (err) {
            res.status(500).json({ message: "Error al eliminar del carrito" });
        }
    };

    /**
     * @swagger
     * /cart/{userId}/clear:
     *   delete:
     *     summary: Vaciar carrito
     *     description: Elimina todos los productos del carrito de un usuario
     *     tags: [Cart]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: userId
     *         required: true
     *         schema:
     *           type: string
     *         description: ID del usuario
     *         example: "507f1f77bcf86cd799439012"
     *     responses:
     *       200:
     *         description: Carrito vaciado exitosamente
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: "Carrito vaciado"
     *       401:
     *         description: No autorizado
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       404:
     *         description: Usuario no encontrado
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
    clearCart = async (req: Request, res: Response) => {
        const userId = req.params.userId;

        try {
            await this.cartUseCase.clearCart(userId);
            res.status(200).json({ message: "Carrito vaciado" });
        } catch (err) {
            res.status(500).json({ message: "Error al vaciar el carrito" });
        }
    };
}
