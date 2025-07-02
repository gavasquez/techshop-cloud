import { Router } from 'express';
import { getProductsController } from '../controllers/product/GetProductsController';
import { findProductsController } from '../controllers/product/FindProductsController';
import { createProductController } from '../controllers/product/CreateProductController';
import { CreateProductSchema } from '../dtos/CreateProductDTO';

const productRoutes = Router();

productRoutes.post('/', createProductController);
productRoutes.get('/', getProductsController);
productRoutes.get('/search', findProductsController);

export default productRoutes;
