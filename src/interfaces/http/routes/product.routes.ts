import { Router } from 'express';
import { ProductMongoRepository } from '../../../infrastructure/mongoose/product/ProductMongoRepository';
import { ProductUseCase } from '../../../application/product/ProductUseCase';
import { ProductController } from '../controllers/product/ProductController';

const productRoutes = Router();

const repository = new ProductMongoRepository();
const productUseCase = new ProductUseCase(repository);
const productController = new ProductController(productUseCase);

productRoutes.post('/', productController.createProductController);
productRoutes.get('/', productController.getProductsController);
productRoutes.get('/search', productController.findProductsController);

export default productRoutes;
