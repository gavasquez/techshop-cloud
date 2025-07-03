import { Request, Response } from "express";
import { ProductMongoRepository } from "../../../../infrastructure/mongoose/product/ProductMongoRepository";
import { ProductUseCase } from "../../../../application/product/ProductUseCase";


export class ProductController {

    constructor(
        private productUseCase: ProductUseCase
    ) { }

    public createProductController = async (req: Request, res: Response) => {
        try {
            const product = await this.productUseCase.createProduct(req.body);
            res.status(201).json({
                message: "Producto creado exitosamente",
                product,
            });
        } catch (err) {
            res.status(500).json({ message: "Error al crear el producto" });
        }
    };

    public getProductsController = async (_req: Request, res: Response) => {
        try {
            const products = await this.productUseCase.getAllProducts();
            res.status(200).json({ products });
        } catch (err) {
            res.status(500).json({ message: "Error al obtener los productos" });
        }
    };

    public findProductsController = async (req: Request, res: Response) => {
        try {
            const products = await this.productUseCase.findProducts(req.query);
            res.status(200).json({ products });
        } catch (err) {
            res.status(500).json({ message: "Error al buscar productos" });
        }
    };
}
