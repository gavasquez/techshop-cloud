import { Router } from 'express';
import { createProductController, getProductsController } from '../controllers/ProductController';

const productRoutes = Router();

productRoutes.post('/', createProductController);
productRoutes.get('/', getProductsController);

export default productRoutes;
