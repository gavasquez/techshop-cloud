import { Request, Response } from "express"; import { ProductModule } from "../../../../modules/product/ProductModule";

export const getProductsController = async (req: Request, res: Response) => {
    try {
        const products = await ProductModule.getAllProductsUseCase.execute();
        res.status(200).json({
            message: "Productos obtenidos exitosamente",
            products,
        });
    } catch (err) {
        res.status(500).json({ message: "Error al obtener los productos" });
    }
};
