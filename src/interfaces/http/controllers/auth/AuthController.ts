import { Request, Response } from 'express';
import { UserUseCase } from '../../../../application/user/UserUseCase';
import { AuthService } from '../../../../infrastructure/security/AuthService';
import { JwtTokenProvider } from '../../../../infrastructure/security/JwtTokenProvider';
import { PasswordEncoder } from '../../../../infrastructure/security/PasswordEncoder';
import { UserMongoRepository } from '../../../../infrastructure/mongoose/user/UserMongoRepository';

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Registrar un nuevo usuario
 *     description: Crea una nueva cuenta de usuario y devuelve tokens JWT automáticamente
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - firstName
 *               - lastName
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "usuario@ejemplo.com"
 *               firstName:
 *                 type: string
 *                 example: "Juan"
 *               lastName:
 *                 type: string
 *                 example: "Pérez"
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 example: "Contraseña123!"
 *               roles:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [USER, ADMIN, PROVIDER]
 *                 example: ["USER"]
 *           example:
 *             email: "usuario@ejemplo.com"
 *             firstName: "Juan"
 *             lastName: "Pérez"
 *             password: "Contraseña123!"
 *             roles: ["USER"]
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente con tokens JWT
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Usuario registrado exitosamente. Ya puedes hacer login."
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *                     tokens:
 *                       type: object
 *                       properties:
 *                         accessToken:
 *                           type: string
 *                           description: Token de acceso (expira en 1 hora)
 *                           example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                         refreshToken:
 *                           type: string
 *                           description: Token de renovación (expira en 7 días)
 *                           example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                         expiresIn:
 *                           type: number
 *                           description: Tiempo de expiración en milisegundos
 *                           example: 3600000
 *       400:
 *         description: Error en los datos de entrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: El email ya está registrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 * 
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
 *                 minLength: 8
 *                 example: "Contraseña123!"
 *           example:
 *             email: "usuario@ejemplo.com"
 *             password: "Contraseña123!"
 *     responses:
 *       200:
 *         description: Login exitoso con tokens JWT
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Login exitoso"
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *                     tokens:
 *                       type: object
 *                       properties:
 *                         accessToken:
 *                           type: string
 *                           description: Token de acceso (expira en 1 hora)
 *                           example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                         refreshToken:
 *                           type: string
 *                           description: Token de renovación (expira en 7 días)
 *                           example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                         expiresIn:
 *                           type: number
 *                           description: Tiempo de expiración en milisegundos
 *                           example: 3600000
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
 * 
 * /auth/refresh:
 *   post:
 *     summary: Renovar token de acceso
 *     description: Renueva el token de acceso usando un refresh token válido
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: Refresh token válido
 *                 example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *           example:
 *             refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *     responses:
 *       200:
 *         description: Token renovado exitosamente
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
 *                     accessToken:
 *                       type: string
 *                       description: Nuevo token de acceso
 *                       example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                     refreshToken:
 *                       type: string
 *                       description: Nuevo refresh token
 *                       example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                     expiresIn:
 *                       type: number
 *                       description: Tiempo de expiración en milisegundos
 *                       example: 3600000
 *       401:
 *         description: Refresh token inválido o expirado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

export class AuthController {
  private readonly authService: AuthService;

  constructor(private readonly userUseCase: UserUseCase) {
    const userRepo = new UserMongoRepository();
    const jwtTokenProvider = new JwtTokenProvider();
    const passwordEncoder = new PasswordEncoder();
    this.authService = new AuthService(jwtTokenProvider, passwordEncoder, userRepo);
  }

  register = async (req: Request, res: Response) => {
    try {
      const { firstName, lastName, email, password } = req.body;
      const result = await this.userUseCase.register(firstName, lastName, email, password);
      
      const response: any = {
        success: true,
        message: "Usuario registrado exitosamente. Ya puedes hacer login.",
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

  refreshToken = async (req: Request, res: Response) => {
    try {
      const { refreshToken } = req.body;
      
      if (!refreshToken) {
        return res.status(400).json({
          success: false,
          message: "Refresh token requerido"
        });
      }

      const result = await this.authService.refreshToken(refreshToken);
      
      if (!result.success || !result.tokens) {
        return res.status(401).json({
          success: false,
          message: result.message || "Refresh token inválido"
        });
      }

      res.status(200).json({
        success: true,
        message: "Token renovado exitosamente",
        data: result.tokens
      });
    } catch (err: any) {
      res.status(401).json({
        success: false,
        message: err.message || "Error al renovar token"
      });
    }
  };
} 