import { Response, Request } from "express";
import { ProductMongoRepository } from "../../../infrastructure/mongoose/product/ProductMongoRepository";
import { CreateProductUseCase, GetAllProductsUseCase } from "../../../application";

const productRepo = new ProductMongoRepository();
const createProductUseCase = new CreateProductUseCase(productRepo);
const getAllProductsUseCase = new GetAllProductsUseCase(productRepo);

export const createProductController = async (req: Request, res: Response) => {
    try {
        const product = await createProductUseCase.execute(req.body);
        res.status(201).json({
            message: 'Producto creado exitosamente',
            product,
        });
    } catch (err) {
        res.status(500).json({ message: 'Error al crear el producto' });
    }
}

export const getProductsController = async (req: Request, res: Response) => {
    try {
        const products = await getAllProductsUseCase.execute();
        res.status(200).json({
            message: 'Productos obtenidos exitosamente',
            products,
        });
    } catch (err) {
        res.status(500).json({ message: 'Error al obtener los productos' });
    }
}