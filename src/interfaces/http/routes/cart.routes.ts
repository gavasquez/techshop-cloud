import { Router } from "express";
import { CartController } from "../controllers/cart/CartController";
import { CartUseCase } from "../../../application/cart/CartUseCase";
import { CartMongoRepository } from "../../../infrastructure/mongoose/cart/CartMongoRepository";

const cartRepository = new CartMongoRepository();
const cartUseCase = new CartUseCase(cartRepository);
const cartController = new CartController(cartUseCase);

const cartRoutes = Router();

cartRoutes.post("/", cartController.addToCart);
cartRoutes.get("/:userId", cartController.getCartItems);
cartRoutes.delete("/:id", cartController.removeFromCart);
cartRoutes.delete("/clear/:userId", cartController.clearCart);

export default cartRoutes;
