import { Request, Response } from "express";
import { CartUseCase } from "../../../../application/cart/CartUseCase";

export class CartController {
    constructor(private readonly cartUseCase: CartUseCase) { }

    addToCart = async (req: Request, res: Response) => {
        const { userId, productId, quantity } = req.body;

        try {
            const item = await this.cartUseCase.addToCart(userId, productId, quantity);
            res.status(201).json({ message: "Producto agregado al carrito", item });
        } catch (err) {
            res.status(500).json({ message: "Error al agregar al carrito" });
        }
    };

    getCartItems = async (req: Request, res: Response) => {
        const userId = req.params.userId;
        try {
            const items = await this.cartUseCase.getCartItems(userId);
            res.status(200).json({ items });
        } catch (err) {
            res.status(500).json({ message: "Error al obtener el carrito" });
        }
    };

    removeFromCart = async (req: Request, res: Response) => {
        const { id } = req.params;

        try {
            await this.cartUseCase.removeFromCart(id);
            res.status(200).json({ message: "Producto eliminado del carrito" });
        } catch (err) {
            res.status(500).json({ message: "Error al eliminar del carrito" });
        }
    };

    clearCart = async (req: Request, res: Response) => {
        const userId = req.params.userId;

        try {
            await this.cartUseCase.clearCart(userId);
            res.status(200).json({ message: "Carrito vaciado" });
        } catch (err) {
            res.status(500).json({ message: "Error al vaciar el carrito" });
        }
    };
}
