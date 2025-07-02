import { Request, Response } from "express";
import { ProductModule } from "../../../../modules/product/ProductModule";

export const createProductController = async (req: Request, res: Response) => {
    try {
        const product = await ProductModule.createProductUseCase.execute(req.body);
        res.status(201).json({ message: "Producto creado exitosamente", product });
    } catch (err) {
        res.status(500).json({ message: "Error al crear el producto" });
    }
};

