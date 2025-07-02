import { Router } from 'express';
import { createProductController } from '../controllers/product/CreateProductController';
import { getProductsController } from '../controllers/product/GetProductsController';

const productRoutes = Router();

productRoutes.post('/', createProductController);
productRoutes.get('/', getProductsController);

export default productRoutes;
