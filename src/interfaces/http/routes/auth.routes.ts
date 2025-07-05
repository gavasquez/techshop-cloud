import { Router, RequestHandler } from 'express';
import { AuthController } from '../controllers/auth/AuthController';
import { UserUseCase } from '../../../application/user/UserUseCase';
import { UserMongoRepository } from '../../../infrastructure/mongoose/user/UserMongoRepository';

const userRepo = new UserMongoRepository();
const userUseCase = new UserUseCase(userRepo);
const authController = new AuthController(userUseCase);

const authRoutes = Router();

// Authentication routes (public)
authRoutes.post('/register', authController.register as RequestHandler);
authRoutes.post('/login', authController.login as RequestHandler);
authRoutes.post('/refresh', authController.refreshToken as RequestHandler);

export default authRoutes; 