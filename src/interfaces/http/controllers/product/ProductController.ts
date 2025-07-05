import { Request, Response } from "express";
import { ProductMongoRepository } from "../../../../infrastructure/mongoose/product/ProductMongoRepository";
import { ProductUseCase } from "../../../../application/product/ProductUseCase";

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       required:
 *         - name
 *         - description
 *         - price
 *         - category
 *         - stockQuantity
 *       properties:
 *         id:
 *           type: string
 *           description: ID único del producto (MongoDB ObjectId)
 *           example: "507f1f77bcf86cd799439011"
 *         name:
 *           type: string
 *           description: Nombre del producto
 *           example: "iPhone 15 Pro"
 *         description:
 *           type: string
 *           description: Descripción del producto
 *           example: "El último iPhone con tecnología avanzada"
 *         price:
 *           type: number
 *           format: float
 *           description: Precio del producto
 *           example: 1299.99
 *         category:
 *           type: string
 *           description: Categoría del producto
 *           example: "Electrónicos"
 *         stockQuantity:
 *           type: integer
 *           description: Cantidad disponible en stock
 *           example: 50
 *         active:
 *           type: boolean
 *           description: Estado activo del producto
 *           example: true
 *         hasStock:
 *           type: boolean
 *           description: Indica si hay stock disponible
 *           example: true
 *         isLowStock:
 *           type: boolean
 *           description: Indica si el stock es bajo (≤5)
 *           example: false
 *         isExpensive:
 *           type: boolean
 *           description: Indica si el producto es caro (>1000)
 *           example: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de creación
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de última actualización
 *     
 *     ProductCreateRequest:
 *       type: object
 *       required:
 *         - name
 *         - description
 *         - price
 *         - category
 *         - stockQuantity
 *       properties:
 *         name:
 *           type: string
 *           example: "iPhone 15 Pro"
 *         description:
 *           type: string
 *           example: "El último iPhone con tecnología avanzada"
 *         price:
 *           type: number
 *           example: 1299.99
 *         category:
 *           type: string
 *           example: "Electrónicos"
 *         stockQuantity:
 *           type: integer
 *           example: 50
 *     
 *     ProductFilterDTO:
 *       type: object
 *       properties:
 *         category:
 *           type: string
 *           description: Filtrar por categoría
 *           example: "Electrónicos"
 *         minPrice:
 *           type: number
 *           description: Precio mínimo
 *           example: 100
 *         maxPrice:
 *           type: number
 *           description: Precio máximo
 *           example: 2000
 *         inStock:
 *           type: boolean
 *           description: Solo productos con stock
 *           example: true
 */


export class ProductController {

    constructor(
        private productUseCase: ProductUseCase
    ) { }

    /**
     * @swagger
     * /products:
     *   post:
     *     summary: Crear un nuevo producto
     *     description: Crea un nuevo producto en el catálogo
     *     tags: [Products]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/ProductCreateRequest'
     *           example:
     *             name: "iPhone 15 Pro"
     *             description: "El último iPhone con tecnología avanzada"
     *             price: 1299.99
     *             category: "Electrónicos"
     *             stockQuantity: 50
     *     responses:
     *       201:
     *         description: Producto creado exitosamente
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: "Producto creado exitosamente"
     *                 product:
     *                   $ref: '#/components/schemas/Product'
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
     *       500:
     *         description: Error interno del servidor
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    public createProductController = async (req: Request, res: Response) => {
        try {
            const product = await this.productUseCase.createProduct(req.body);
            res.status(201).json({
                message: "Producto creado exitosamente",
                product,
            });
        } catch (err) {
            res.status(500).json({ message: "Error al crear el producto" });
        }
    };

    /**
     * @swagger
     * /products:
     *   get:
     *     summary: Obtener todos los productos
     *     description: Obtiene la lista completa de productos disponibles
     *     tags: [Products]
     *     responses:
     *       200:
     *         description: Lista de productos obtenida exitosamente
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 products:
     *                   type: array
     *                   items:
     *                     $ref: '#/components/schemas/Product'
     *       500:
     *         description: Error interno del servidor
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    public getProductsController = async (_req: Request, res: Response) => {
        try {
            const products = await this.productUseCase.getAllProducts();
            res.status(200).json({ products });
        } catch (err) {
            res.status(500).json({ message: "Error al obtener los productos" });
        }
    };

    /**
     * @swagger
     * /products/search:
     *   get:
     *     summary: Buscar productos con filtros
     *     description: Busca productos aplicando filtros específicos
     *     tags: [Products]
     *     parameters:
     *       - in: query
     *         name: category
     *         schema:
     *           type: string
     *         description: Filtrar por categoría
     *         example: "Electrónicos"
     *       - in: query
     *         name: minPrice
     *         schema:
     *           type: number
     *         description: Precio mínimo
     *         example: 100
     *       - in: query
     *         name: maxPrice
     *         schema:
     *           type: number
     *         description: Precio máximo
     *         example: 2000
     *       - in: query
     *         name: inStock
     *         schema:
     *           type: boolean
     *         description: Solo productos con stock
     *         example: true
     *     responses:
     *       200:
     *         description: Productos encontrados exitosamente
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 products:
     *                   type: array
     *                   items:
     *                     $ref: '#/components/schemas/Product'
     *       400:
     *         description: Parámetros de búsqueda inválidos
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
    public findProductsController = async (req: Request, res: Response) => {
        try {
            const products = await this.productUseCase.findProducts(req.query);
            res.status(200).json({ products });
        } catch (err) {
            res.status(500).json({ message: "Error al buscar productos" });
        }
    };
}
