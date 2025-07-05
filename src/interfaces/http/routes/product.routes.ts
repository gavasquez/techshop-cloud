import { Router, RequestHandler } from 'express';
import { ProductMongoRepository } from '../../../infrastructure/mongoose/product/ProductMongoRepository';
import { ProductUseCase } from '../../../application/product/ProductUseCase';
import { ProductController } from '../controllers/product/ProductController';
import { AuthMiddleware } from '../../../infrastructure/security/AuthMiddleware';
import { JwtTokenProvider } from '../../../infrastructure/security/JwtTokenProvider';
import { UserMongoRepository } from '../../../infrastructure/mongoose/user/UserMongoRepository';

const productRoutes = Router();

const repository = new ProductMongoRepository();
const productUseCase = new ProductUseCase(repository);
const productController = new ProductController(productUseCase);

// Auth middleware setup
const userRepo = new UserMongoRepository();
const jwtTokenProvider = new JwtTokenProvider();
const authMiddleware = new AuthMiddleware(jwtTokenProvider, userRepo);

// Public routes (no authentication required)
productRoutes.get('/', productController.getProductsController);
productRoutes.get('/search', productController.findProductsController);

// Protected routes (authentication required)
productRoutes.post('/', authMiddleware.authenticate as RequestHandler, productController.createProductController as RequestHandler);

export default productRoutes;
