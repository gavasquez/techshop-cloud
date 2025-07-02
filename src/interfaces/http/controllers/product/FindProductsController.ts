import { Request, Response } from "express";
import { ProductModule } from "../../../../modules/product/ProductModule";

export const findProductsController = async (req: Request, res: Response) => {
    try {
        const products = await ProductModule.findProductsUseCase.execute(req.query);
        res.status(200).json({ products });
    } catch (error) {
        res.status(500).json({ message: "Error al buscar productos" });
    }
};
