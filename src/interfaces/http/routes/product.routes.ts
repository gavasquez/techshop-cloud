import { Router } from 'express';
import { ProductMongoRepository } from '../../../infrastructure/mongoose/product/ProductMongoRepository';
import { CreateProductUseCase } from '../../../application/product/CreateProductUseCase';

const productRoutes = Router();
const productRepo = new ProductMongoRepository();
const createProductUseCase = new CreateProductUseCase(productRepo);

productRoutes.post('/', async (req, res) => {
    try {
        const product = await createProductUseCase.execute(req.body);
        res.status(201).json({
            message: 'Producto creado exitosamente',
            product,
        });
    } catch (err) {
        res.status(500).json({ message: 'Error al crear el producto' });
    }
});

export default productRoutes;
