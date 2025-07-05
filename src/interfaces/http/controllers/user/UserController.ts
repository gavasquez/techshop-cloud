import { Request, Response } from "express";
import { UserUseCase } from "../../../../application/user/UserUseCase";

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: ID único del usuario (MongoDB ObjectId)
 *           example: "507f1f77bcf86cd799439011"
 *         email:
 *           type: string
 *           format: email
 *           description: Email del usuario
 *           example: "usuario@ejemplo.com"
 *         firstName:
 *           type: string
 *           description: Nombre del usuario
 *           example: "Juan"
 *         lastName:
 *           type: string
 *           description: Apellido del usuario
 *           example: "Pérez"
 *         fullName:
 *           type: string
 *           description: Nombre completo del usuario
 *           example: "Juan Pérez"
 *         roles:
 *           type: array
 *           items:
 *             type: string
 *             enum: [USER, ADMIN, PROVIDER]
 *           description: Roles del usuario
 *           example: ["USER"]
 *         active:
 *           type: boolean
 *           description: Estado activo del usuario
 *           example: true
 *         emailVerified:
 *           type: boolean
 *           description: Estado de verificación del email (automático)
 *           example: true
 *         lastLoginAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: Fecha del último login
 *           example: null
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de creación
 *           example: "2024-01-01T00:00:00.000Z"
 *         isNewUser:
 *           type: boolean
 *           description: Indica si es un usuario nuevo
 *           example: true
 *         daysSinceCreation:
 *           type: number
 *           description: Días desde la creación de la cuenta
 *           example: 0
 *     
 *     UserResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           $ref: '#/components/schemas/User'
 *     
 *     UserCreateRequest:
 *       type: object
 *       required:
 *         - email
 *         - firstName
 *         - lastName
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: "usuario@ejemplo.com"
 *         firstName:
 *           type: string
 *           example: "Juan"
 *         lastName:
 *           type: string
 *           example: "Pérez"
 *         password:
 *           type: string
 *           example: "Contraseña123!"
 *         roles:
 *           type: array
 *           items:
 *             type: string
 *             enum: [USER, ADMIN, PROVIDER]
 *           example: ["USER"]
 */

export class UserController {
    constructor(private readonly userUseCase: UserUseCase) { }

    /**
      * @swagger
 * /users/profile/{id}:
 *   get:
 *     summary: Obtener perfil de usuario
 *     description: Obtiene la información del perfil de un usuario específico (requiere autenticación)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Perfil de usuario obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/User'
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
    register = async (req: Request, res: Response) => {
        try {
            const { firstName, lastName, email, password } = req.body;
            const result = await this.userUseCase.register(firstName, lastName, email, password);
            
            const response: any = {
                success: true,
                message: "Usuario registrado exitosamente",
                data: {
                    user: result.user.toDto()
                }
            };

            // Si hay tokens, incluirlos en la respuesta
            if (result.tokens) {
                response.data.tokens = result.tokens;
            }

            res.status(201).json(response);
        } catch (err: any) {
            res.status(400).json({ 
                success: false,
                message: err.message 
            });
        }
    };

    /**
     * @swagger
     * /auth/login:
     *   post:
     *     summary: Iniciar sesión de usuario
     *     description: Autentica un usuario y devuelve tokens JWT (access y refresh)
     *     tags: [Authentication]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - email
     *               - password
     *             properties:
     *               email:
     *                 type: string
     *                 format: email
     *                 example: "usuario@ejemplo.com"
     *               password:
     *                 type: string
     *                 example: "Contraseña123!"
     *           example:
     *             email: "usuario@ejemplo.com"
     *             password: "Contraseña123!"
     *     responses:
     *       200:
     *         description: Login exitoso
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
     *                     token:
     *                       type: string
     *                       description: JWT token para autenticación
     *                       example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
     *                     user:
     *                       $ref: '#/components/schemas/User'
     *       401:
     *         description: Credenciales inválidas
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       423:
     *         description: Cuenta bloqueada temporalmente
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    login = async (req: Request, res: Response) => {
        try {
            const { email, password } = req.body;
            const result = await this.userUseCase.login(email, password);
            
            res.status(200).json({
                success: true,
                message: "Login exitoso",
                data: {
                    user: result.user.toDto(),
                    tokens: result.tokens
                }
            });
        } catch (err: any) {
            res.status(401).json({ 
                success: false,
                message: err.message 
            });
        }
    };

    /**
     * @swagger
     * /users/{id}:
     *   get:
     *     summary: Obtener perfil de usuario
     *     description: Obtiene la información del perfil de un usuario específico
     *     tags: [Users]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: ID del usuario
     *         example: "507f1f77bcf86cd799439011"
     *     responses:
     *       200:
     *         description: Perfil de usuario obtenido exitosamente
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 user:
     *                   $ref: '#/components/schemas/User'
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
    getProfile = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const user = await this.userUseCase.getProfile(id);
            if (!user) res.status(404).json({ message: "Usuario no encontrado" });
            res.status(200).json({ user: user?.toDto() });
        } catch (err) {
            res.status(500).json({ message: "Error al obtener perfil" });
        }
    };
}
